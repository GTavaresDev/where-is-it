import { promises as fs } from "fs";
import path from "path";
import type { SeedRastreamento } from "./seed";
import {
  STATUS_STEP_MS,
  buildEventForStatusIndex,
  formatSswDate,
  statusIndexForElapsed,
  statusTitleAt,
} from "./status-pipeline";

export type Coleta = SeedRastreamento & {
  statusIndex: number;
  createdAt?: string;
  senderCnpj?: string;
  sender?: string;
};

const SSW_DATE_TIME = /^(\d{2})\/(\d{2})\/(\d{2})(?:\s+(\d{2}):(\d{2}))?$/;

const COLETAS_PATH = path.join(process.cwd(), "data", "coletas.json");
const NF_BASE = 9000;

function parseSswDateTime(value: string): Date | null {
  const match = SSW_DATE_TIME.exec(value.trim());

  if (!match) {
    return null;
  }

  const date = new Date(
    2000 + Number(match[3]),
    Number(match[2]) - 1,
    Number(match[1]),
    Number(match[4] ?? "0"),
    Number(match[5] ?? "0"),
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function resolveCreatedAt(coleta: Coleta): Date {
  if (coleta.createdAt) {
    const parsed = new Date(coleta.createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  let earliest: Date | null = null;

  for (const event of coleta.events) {
    const parsed = parseSswDateTime(event.dateTime);
    if (!parsed) {
      continue;
    }

    if (!earliest || parsed.getTime() < earliest.getTime()) {
      earliest = parsed;
    }
  }

  if (earliest) {
    return earliest;
  }

  return new Date();
}

function eventsUntil(createdAt: Date, statusIndex: number): Coleta["events"] {
  const events: Coleta["events"] = [];

  for (let index = statusIndex; index >= 0; index -= 1) {
    const at = new Date(createdAt.getTime() + index * STATUS_STEP_MS);
    events.push(buildEventForStatusIndex(index, at));
  }

  return events;
}

function applyElapsedStatus(coleta: Coleta, now = new Date()): boolean {
  const createdAt = resolveCreatedAt(coleta);
  const statusIndex = statusIndexForElapsed(createdAt, now);
  const events = eventsUntil(createdAt, statusIndex);
  const createdAtIso = createdAt.toISOString();
  const sameCreated = coleta.createdAt === createdAtIso;
  const sameIndex = coleta.statusIndex === statusIndex;
  const sameEvents = JSON.stringify(coleta.events) === JSON.stringify(events);

  if (sameCreated && sameIndex && sameEvents) {
    return false;
  }

  coleta.createdAt = createdAtIso;
  coleta.statusIndex = statusIndex;
  coleta.events = events;
  return true;
}

async function readColetas(): Promise<Coleta[]> {
  let parsed: Coleta[] = [];

  try {
    const raw = await fs.readFile(COLETAS_PATH, "utf8");
    const json = JSON.parse(raw) as Coleta[];
    if (Array.isArray(json)) {
      parsed = json;
    } else {
      throw new Error("O arquivo de coletas deve conter uma lista JSON.");
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw new Error("Não foi possível ler as coletas persistidas.", {
      cause: error,
    });
  }

  let changed = false;

  for (const coleta of parsed) {
    if (applyElapsedStatus(coleta)) {
      changed = true;
    }
  }

  if (changed) {
    await writeColetas(parsed);
  }

  return parsed;
}

async function writeColetas(coletas: Coleta[]): Promise<void> {
  await fs.mkdir(path.dirname(COLETAS_PATH), { recursive: true });
  await fs.writeFile(COLETAS_PATH, `${JSON.stringify(coletas, null, 2)}\n`, "utf8");
}

function nextNfNumber(coletas: Coleta[]): string {
  let maxNf = NF_BASE;

  for (const coleta of coletas) {
    const numeric = Number(coleta.nfNumber.replace(/\D/g, ""));
    if (!Number.isNaN(numeric) && numeric > maxNf) {
      maxNf = numeric;
    }
  }

  return String(maxNf + 1);
}

export function toRastreamento(coleta: Coleta): SeedRastreamento {
  return {
    id: coleta.id,
    cnpj: coleta.cnpj,
    recipient: coleta.recipient,
    senderCnpj: coleta.senderCnpj,
    sender: coleta.sender,
    nfNumber: coleta.nfNumber,
    orderNumber: coleta.orderNumber,
    pickupDate: coleta.pickupDate,
    events: coleta.events,
  };
}

export async function listarColetas(): Promise<Coleta[]> {
  return readColetas();
}

export async function findColetaById(id: string): Promise<Coleta | undefined> {
  const coletas = await readColetas();
  return coletas.find((item) => item.id === id);
}

export async function findColetasByCnpjAndNf({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): Promise<Coleta[]> {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  const cleanNf = nfNumber.replace(/\D/g, "");
  const coletas = await readColetas();

  return coletas.filter((item) => {
    const destinatario = item.cnpj.replace(/\D/g, "") === cleanCnpj;
    const remetente = (item.senderCnpj ?? "").replace(/\D/g, "") === cleanCnpj;
    if (!destinatario && !remetente) {
      return false;
    }

    if (!cleanNf) {
      return true;
    }

    return item.nfNumber.replace(/\D/g, "") === cleanNf;
  });
}

export async function criarColeta(cnpj: string): Promise<Coleta> {
  const cleanCnpj = cnpj.replace(/\D/g, "").trim();

  if (cleanCnpj.length < 14) {
    throw new Error("CNPJ inválido.");
  }

  const coletas = await readColetas();
  const nfNumber = nextNfNumber(coletas);
  const createdAt = new Date();
  const id = `coleta-${nfNumber}`;

  const coleta: Coleta = {
    id,
    cnpj: cleanCnpj,
    recipient: `DESTINATARIO ${cleanCnpj}`,
    nfNumber,
    orderNumber: `PED-ORBE-${nfNumber}`,
    pickupDate: formatSswDate(createdAt),
    createdAt: createdAt.toISOString(),
    statusIndex: 0,
    events: eventsUntil(createdAt, 0),
  };

  coletas.push(coleta);
  await writeColetas(coletas);
  return coleta;
}

export function statusAtualDaColeta(coleta: Coleta): string {
  return statusTitleAt(coleta.statusIndex);
}

import type { SeedEvento } from "./seed";

export type StatusStep = {
  title: string;
  location: string;
  unit: string;
  detail: string;
};

/** Sequência feliz de ocorrências SSW usadas no mock. */
export const STATUS_PIPELINE: StatusStep[] = [
  {
    title: "DOCUMENTO DE TRANSPORTE EMITIDO",
    location: "SAO PAULO - SP",
    unit: "SPO",
    detail: "CTRC emitido para coleta Orbe",
  },
  {
    title: "CHEGADA EM UNIDADE",
    location: "CAMPINAS - SP",
    unit: "CPS",
    detail: "Mercadoria disponível para transferência",
  },
  {
    title: "EM TRANSITO",
    location: "CAMPINAS - SP",
    unit: "CPS",
    detail: "Em transferência para unidade de destino",
  },
  {
    title: "SAIDA PARA ENTREGA",
    location: "SAO PAULO - SP",
    unit: "SPO",
    detail: "Saiu para entrega na região metropolitana",
  },
  {
    title: "MERCADORIA ENTREGUE",
    location: "SAO PAULO - SP",
    unit: "SPO",
    detail: "Entrega realizada ao destinatário",
  },
];

export const STATUS_PIPELINE_LAST_INDEX = STATUS_PIPELINE.length - 1;
export const STATUS_STEP_MS = 120_000;

export function formatSswDateTime(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatSswDate(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export function statusIndexForElapsed(createdAt: Date, now = new Date()): number {
  const elapsed = now.getTime() - createdAt.getTime();

  if (elapsed < STATUS_STEP_MS) {
    return 0;
  }

  const steps = Math.floor(elapsed / STATUS_STEP_MS);

  if (steps > STATUS_PIPELINE_LAST_INDEX) {
    return STATUS_PIPELINE_LAST_INDEX;
  }

  return steps;
}

export function buildEventForStatusIndex(
  statusIndex: number,
  date = new Date(),
): SeedEvento {
  const step = STATUS_PIPELINE[statusIndex];

  if (!step) {
    throw new Error(`Índice de status inválido: ${statusIndex}`);
  }

  return {
    dateTime: formatSswDateTime(date),
    location: step.location,
    unit: step.unit,
    title: step.title,
    detail: step.detail,
  };
}

export function statusTitleAt(statusIndex: number): string {
  return STATUS_PIPELINE[statusIndex]?.title ?? STATUS_PIPELINE[0].title;
}

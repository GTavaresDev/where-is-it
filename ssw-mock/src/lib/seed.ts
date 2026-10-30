import seedData from "../../data/rastreamentos.json";
import {
  findColetaById,
  findColetasByCnpjAndNf,
  toRastreamento,
} from "./coletas";
import { papelDoCnpj, type Papel } from "./papel";

export type SeedEvento = {
  dateTime: string;
  location: string;
  unit: string;
  title: string;
  detail: string;
};

export type SeedRastreamento = {
  id: string;
  cnpj: string;
  recipient: string;
  senderCnpj?: string;
  sender?: string;
  nfNumber: string;
  orderNumber: string;
  pickupDate: string;
  events: SeedEvento[];
};

export const rastreamentos = seedData as SeedRastreamento[];

export type EncomendaEncontrada = SeedRastreamento & {
  papel: Papel;
};

function combinaCnpjENf(
  item: SeedRastreamento,
  cnpj: string,
  nfNumber: string,
): EncomendaEncontrada | null {
  const papel = papelDoCnpj(item, cnpj);
  if (!papel) {
    return null;
  }

  const cleanNf = nfNumber.replace(/\D/g, "");
  if (cleanNf && item.nfNumber.replace(/\D/g, "") !== cleanNf) {
    return null;
  }

  return { ...item, papel };
}

function filterSeedByCnpjAndNf({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): EncomendaEncontrada[] {
  const found: EncomendaEncontrada[] = [];

  for (const item of rastreamentos) {
    const match = combinaCnpjENf(item, cnpj, nfNumber);
    if (match) {
      found.push(match);
    }
  }

  return found;
}

export async function findByCnpjAndNf({
  cnpj,
  nfNumber,
}: {
  cnpj: string;
  nfNumber: string;
}): Promise<EncomendaEncontrada[]> {
  const fromSeed = filterSeedByCnpjAndNf({ cnpj, nfNumber });
  const fromColetas = await findColetasByCnpjAndNf({ cnpj, nfNumber });
  const found = [...fromSeed];

  for (const coleta of fromColetas) {
    const match = combinaCnpjENf(toRastreamento(coleta), cnpj, nfNumber);
    if (match) {
      found.push(match);
    }
  }

  return found;
}

export async function findById(
  id: string,
): Promise<SeedRastreamento | undefined> {
  const fromSeed = rastreamentos.find((item) => item.id === id);
  if (fromSeed) {
    return fromSeed;
  }

  const fromColeta = await findColetaById(id);
  if (!fromColeta) {
    return undefined;
  }

  return toRastreamento(fromColeta);
}

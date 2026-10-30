import type { SeedRastreamento } from "./seed";
import { deriveStatus } from "./derive-status";

export type ApiEvento = {
  dateTime: string;
  location: string;
  unit: string;
  description: string;
  status: string;
};

export type ApiEncomenda = {
  id: string;
  cnpj: string;
  recipient: string;
  nfNumber: string;
  orderNumber: string;
  pickupDate: string | null;
  currentStatus: string;
  events: ApiEvento[];
};

export function mapToApiEncomenda(item: SeedRastreamento): ApiEncomenda {
  const events = item.events.map((event) => {
    const status = deriveStatus(event.title, event.detail);
    return {
      dateTime: event.dateTime,
      location: event.location,
      unit: event.unit,
      description: `${event.title} — ${event.detail}`,
      status,
    };
  });

  let currentStatus = "desconhecido";
  if (events[0]) {
    currentStatus = events[0].status;
  }

  return {
    id: item.id,
    cnpj: item.cnpj,
    recipient: item.recipient,
    nfNumber: item.nfNumber,
    orderNumber: item.orderNumber,
    pickupDate: item.pickupDate,
    currentStatus,
    events,
  };
}

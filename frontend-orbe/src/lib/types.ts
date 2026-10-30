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
  sender?: string;
  senderCnpj?: string;
  papel?: "remetente" | "destinatario";
  nfNumber: string;
  orderNumber: string;
  pickupDate: string | null;
  currentStatus: string;
  events: ApiEvento[];
  statusLabel?: string;
};

export type ApiSuccessList = {
  success: true;
  data: ApiEncomenda[];
  scrapedAt: string;
};

export type ApiSuccessOne = {
  success: true;
  data: ApiEncomenda;
  scrapedAt: string;
};

export type ApiFailure = {
  success: false;
  error: string;
  code: string;
};

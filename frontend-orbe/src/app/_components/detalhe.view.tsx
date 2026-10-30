import Link from "next/link";
import type { ApiEncomenda } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DetalheViewProps = {
  data: ApiEncomenda;
};

export function DetalheView({ data }: DetalheViewProps) {
  return (
    <div className="flex flex-1 flex-col px-6 pb-12">
      <h1 className="py-8 text-center text-xl font-semibold tracking-tight">
        Nota fiscal {data.nfNumber}
      </h1>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <p>
          <Link href="/consulta" className="text-sm font-medium text-primary">
            « Voltar à consulta
          </Link>
        </p>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Dados da nota</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Destinatário</dt>
                <dd className="font-medium">{data.recipient}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status atual</dt>
                <dd className="font-medium">{data.currentStatus}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Pedido</dt>
                <dd className="font-medium">{data.orderNumber}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Coleta</dt>
                <dd className="font-medium">{data.pickupDate}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">CNPJ</dt>
                <dd className="font-medium">{data.cnpj}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Código</dt>
                <dd className="font-medium">{data.id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data / Hora</TableHead>
                  <TableHead>Ocorrência</TableHead>
                  <TableHead>Local / Unidade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.events.map((event, index) => (
                  <TableRow key={`${event.dateTime}-${index}`}>
                    <TableCell>{event.dateTime}</TableCell>
                    <TableCell>{event.description}</TableCell>
                    <TableCell>
                      {event.location} / {event.unit}
                    </TableCell>
                    <TableCell>{event.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

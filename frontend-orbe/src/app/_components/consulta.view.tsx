"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  consultarAction,
  type ConsultaResult,
} from "../actions/consultar.action";
import { papelLabel } from "@/lib/papel";
import type { ApiEncomenda } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FiltroPapel = "todos" | "remetente" | "destinatario";

export function ConsultaView({
  papel,
  cnpjInicial,
}: {
  papel: FiltroPapel;
  cnpjInicial: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cnpj, setCnpj] = useState("11222333000181");
  const [resultado, setResultado] = useState<ConsultaResult | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (papel !== "todos" && cnpjInicial && !resultado) {
      startTransition(async () => {
        setResultado(await consultarAction({ cnpj: cnpjInicial, nfNumber: "" }));
      });
    }
  }, [cnpjInicial, papel, resultado]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResultado(null);
    startTransition(async () => {
      const cleanCnpj = cnpj.replace(/\D/g, "");
      const result = await consultarAction({ cnpj: cleanCnpj, nfNumber: "" });
      setResultado(result);
      if (result.ok) {
        router.replace(`/consulta?cnpj=${encodeURIComponent(cleanCnpj)}`);
      }
    });
  }

  let submitLabel = "Buscar encomendas";
  if (isPending) {
    submitLabel = "Buscando...";
  }

  let panel: ReactNode = (
    <p className="text-center text-sm text-muted-foreground">
      Informe o CNPJ para ver encomendas enviadas e recebidas.
    </p>
  );

  if (resultado?.ok) {
    const items =
      papel === "todos"
        ? resultado.data
        : resultado.data.filter((item) => item.papel === papel);
    panel = <ListaEncomendas items={items} papel={papel} />;
  } else if (resultado && !resultado.ok) {
    panel = (
      <p className="rounded-lg border border-destructive/30 bg-white px-4 py-3 text-sm font-medium text-destructive">
        {resultado.error}
      </p>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-6 pb-12">
      <h1 className="py-8 text-center text-xl font-semibold tracking-tight">
        Rastreamento
      </h1>
      {papel === "todos" && <Card className="mx-auto w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Rastreamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                className="h-11"
                value={cnpj}
                onChange={(event) => setCnpj(event.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full text-base"
              disabled={isPending}
            >
              {submitLabel}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              O CNPJ 11222333000181 tem encomendas como remetente e como destinatário.
            </p>
          </form>
        </CardContent>
      </Card>}
      <div className="mx-auto mt-6 w-full max-w-4xl">{panel}</div>
    </div>
  );
}

function ListaEncomendas({
  items,
  papel,
}: {
  items: ApiEncomenda[];
  papel: FiltroPapel;
}) {
  const titulo =
    papel === "remetente"
      ? "Encomendas enviadas"
      : papel === "destinatario"
        ? "Encomendas recebidas"
        : "Resultados";

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NF</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Remetente</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Coleta</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nfNumber}</TableCell>
                <TableCell>{papelLabel(item.papel)}</TableCell>
                <TableCell>{item.sender || "Informação indisponível"}</TableCell>
                <TableCell>{item.recipient}</TableCell>
                <TableCell>{item.currentStatus}</TableCell>
                <TableCell>{item.pickupDate}</TableCell>
                <TableCell>
                  <Link
                    href={`/detalhe/${item.id}`}
                    className="font-medium text-primary"
                  >
                    Ver detalhes
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

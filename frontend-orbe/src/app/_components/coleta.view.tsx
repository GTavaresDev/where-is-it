"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listarColetasAction } from "../actions/listar-coletas.action";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ApiEncomenda } from "@/lib/types";
import { Truck } from "lucide-react";

export function ColetaView() {
  const [coletas, setColetas] = useState<ApiEncomenda[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarColetas() {
    setLoading(true);
    const result = await listarColetasAction({ cnpj: "11222333000181" });
    if (result.ok) setColetas(result.data);
    setLoading(false);
  }

  useEffect(() => {
    void carregarColetas();
  }, []);

  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Coletas</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe as coletas registradas no sistema.
            </p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Coletas persistidas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Carregando coletas...
              </p>
            ) : coletas.length > 0 ? (
              <div className="flex flex-col gap-3">
                {coletas.map((coleta) => (
                  <div
                    key={coleta.id}
                    className="flex items-center justify-between rounded-lg border p-3.5 text-sm transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Truck className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          NF {coleta.nfNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {coleta.pickupDate ? `Data: ${coleta.pickupDate} · ` : ""}
                          CNPJ: {coleta.cnpj}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/detalhe/${coleta.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma coleta encontrada. Use o botão no topo para criar uma nova coleta.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

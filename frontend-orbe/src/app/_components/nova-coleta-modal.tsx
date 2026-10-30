"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  criarColetaAction,
  type CriarColetaResult,
} from "@/app/actions/criar-coleta.action";

export function NovaColetaModal() {
  const [open, setOpen] = useState(false);
  const [cnpj, setCnpj] = useState("11222333000181");
  const [resultado, setResultado] = useState<CriarColetaResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResultado(null);

    startTransition(async () => {
      const result = await criarColetaAction({ cnpj });
      setResultado(result);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setResultado(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5 shadow-sm">
            <Plus className="size-4" />
            <span>Nova coleta</span>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck className="size-4" />
            </div>
            <DialogTitle>Nova coleta</DialogTitle>
          </div>
          <DialogDescription>
            Informe o CNPJ do destinatário para solicitar uma nova coleta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="modal-cnpj">CNPJ destinatário</Label>
            <Input
              id="modal-cnpj"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="h-10"
              autoFocus
            />
          </div>

          {resultado && !resultado.ok && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {resultado.error}
            </div>
          )}

          {resultado?.ok && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm flex flex-col gap-2">
              <div className="font-medium text-foreground">
                Coleta gerada com sucesso!
              </div>
              <div className="text-xs text-muted-foreground flex flex-col gap-1">
                <span>NF: <strong>{resultado.data.nfNumber}</strong></span>
                <span>Status: <strong>{resultado.data.statusLabel || resultado.data.currentStatus}</strong></span>
              </div>
              <div className="pt-1 flex gap-2">
                <Link
                  href={`/detalhe/${resultado.data.id}`}
                  onClick={() => setOpen(false)}
                  className="text-xs font-semibold text-primary underline underline-offset-2"
                >
                  Ver detalhes
                </Link>
                <span className="text-muted-foreground">·</span>
                <Link
                  href="/coleta"
                  onClick={() => setOpen(false)}
                  className="text-xs font-semibold text-primary underline underline-offset-2"
                >
                  Ir para Coletas
                </Link>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="mt-2 h-10 w-full"
          >
            {isPending ? "Gerando coleta..." : "Gerar coleta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


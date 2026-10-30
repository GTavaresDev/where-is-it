import Link from "next/link";
import { DetalheView } from "../../_components/detalhe.view";
import { detalheNoMock } from "@/lib/ssw-mock-client";

type DetalhePageProps = {
  params: Promise<{ id: string }>;
};

export default async function DetalhePage({ params }: DetalhePageProps) {
  const { id } = await params;
  const result = await detalheNoMock(id);

  if (!result.ok) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-6 py-16">
        <p className="rounded-lg border border-destructive/30 bg-white px-4 py-3 text-sm font-medium text-destructive">
          {result.error}
        </p>
        <Link href="/consulta" className="text-sm font-medium text-primary">
          « Voltar à consulta
        </Link>
      </div>
    );
  }

  return <DetalheView data={result.data} />;
}

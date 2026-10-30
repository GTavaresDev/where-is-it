import { NextResponse } from "next/server";
import { findById } from "@/lib/seed";
import { mapToApiEncomenda } from "@/lib/map-encomenda";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const item = await findById(id);

  if (!item) {
    return NextResponse.json(
      {
        success: false,
        error: "Encomenda não encontrada.",
        code: "NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: mapToApiEncomenda(item),
    scrapedAt: new Date().toISOString(),
  });
}

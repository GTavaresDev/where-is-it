"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, Home, MapPin, Truck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Header } from "./header";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const papelSelecionado = searchParams.get("papel");
  const cnpj = searchParams.get("cnpj");
  const queryCnpj = cnpj ? `&cnpj=${encodeURIComponent(cnpj)}` : "";

  let consultaActive = false;
  if (pathname === "/consulta" || pathname.startsWith("/detalhe")) {
    consultaActive = true;
  }

  let coletaActive = false;
  if (pathname === "/coleta" || pathname.startsWith("/coleta/")) {
    coletaActive = true;
  }

  const [rastreamentoAberto, setRastreamentoAberto] = useState(consultaActive);
  const inicioAtivo = pathname === "/consulta" && !papelSelecionado;

  let rastreamentoIcon = <ChevronRight className="ml-auto" />;
  if (rastreamentoAberto) {
    rastreamentoIcon = <ChevronDown className="ml-auto" />;
  }

  let submenu: ReactNode = null;
  if (rastreamentoAberto) {
    submenu = (
      <SidebarMenuSub>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton
            render={<Link href={`/consulta?papel=destinatario${queryCnpj}`} />}
            isActive={consultaActive && papelSelecionado === "destinatario"}
          >
            <span>Recebidas (destinatário)</span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
        <SidebarMenuSubItem>
          <SidebarMenuSubButton
            render={<Link href={`/consulta?papel=remetente${queryCnpj}`} />}
            isActive={consultaActive && papelSelecionado === "remetente"}
          >
            <span>Enviadas (remetente)</span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    );
  }

  return (
    <SidebarProvider className="min-h-svh">
      <Sidebar collapsible="none" className="sticky top-0 h-svh border-r">
        <SidebarHeader className="px-4 py-5">
          <Link href="/consulta" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              O
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Orbe
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="py-1">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/consulta" />}
                    isActive={inicioAtivo}
                  >
                    <Home />
                    <span>Início</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    type="button"
                    aria-expanded={rastreamentoAberto}
                    onClick={() => {
                      setRastreamentoAberto((aberto) => !aberto);
                    }}
                  >
                    <MapPin />
                    <span>Rastreamento</span>
                    {rastreamentoIcon}
                  </SidebarMenuButton>
                  {submenu}
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/coleta" />}
                    isActive={coletaActive}
                  >
                    <Truck />
                    <span>Coletas</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-background flex flex-col min-h-svh">
        <Header />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

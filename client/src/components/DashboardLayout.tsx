import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarGroup, SidebarGroupLabel, SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard, LogOut, PanelLeft, Route, Bot, ShieldCheck, Users, Zap, MessageCircle,
  Settings, Crown, Gauge, Target, BarChart3, Package, FolderKanban, BookOpen, FileText,
  Trophy, TrendingUp, Crosshair, Rocket, Calculator, RefreshCw, Handshake, Lightbulb, ChevronDown,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

// ===== NAVIGATION STRUCTURE: 4 Verticals =====

type MenuItem = {
  icon: any;
  label: string;
  path: string;
  founderOnly?: boolean;
  layers?: ("direcao" | "gerente" | "operacional")[];
};

const estrategiaItems: MenuItem[] = [
  { icon: Gauge, label: "Comando", path: "/dashboard" },
  { icon: Route, label: "Trilha", path: "/trail" },
  { icon: Target, label: "Metas", path: "/goals" },
  { icon: BarChart3, label: "KPIs", path: "/kpis" },
  { icon: Crosshair, label: "ICP Builder", path: "/icp" },
  { icon: Calculator, label: "Forecast", path: "/forecast" },
];

const operacionalItems: MenuItem[] = [
  { icon: Users, label: "CRM", path: "/crm" },
  { icon: MessageCircle, label: "WhatsApp", path: "/whatsapp" },
  { icon: BookOpen, label: "Playbooks", path: "/playbooks" },
  { icon: FileText, label: "Propostas", path: "/proposals" },
  { icon: Package, label: "Produtos", path: "/products" },
  { icon: FolderKanban, label: "Projetos", path: "/projects" },
];

const analiticoItems: MenuItem[] = [
  { icon: ShieldCheck, label: "AGC", path: "/agc" },
  { icon: Bot, label: "Copiloto IA", path: "/copilot" },
  { icon: TrendingUp, label: "Relatórios", path: "/reports" },
  { icon: Rocket, label: "Geração de Demanda", path: "/demand" },
  { icon: Handshake, label: "Pós-Venda", path: "/post-sales" },
  { icon: Trophy, label: "Gamificação", path: "/gamification" },
];

const sistemaItems: MenuItem[] = [
  { icon: Zap, label: "Automações", path: "/automations" },
  { icon: Lightbulb, label: "Onboarding", path: "/onboarding" },
  { icon: RefreshCw, label: "Metodologia", path: "/methodology" },
  { icon: Crown, label: "Master Admin", path: "/admin", founderOnly: true },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

const allMenuItems = [...estrategiaItems, ...operacionalItems, ...analiticoItems, ...sistemaItems];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const SIDEBAR_GROUPS_KEY = "sidebar-groups";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

function canAccess(item: MenuItem, userLayer?: string, isFounder?: boolean): boolean {
  if (item.founderOnly && !isFounder) return false;
  if (item.layers && userLayer && !item.layers.includes(userLayer as any)) return false;
  return true;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(SIDEBAR_GROUPS_KEY);
    return saved ? JSON.parse(saved) : { estrategia: true, operacional: true, analitico: true, sistema: true };
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gauge className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Máquina de Vendas</h1>
                <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase">Vértice 8x</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
              Acesse o cockpit de comando da sua operação comercial.
            </p>
          </div>
          <Button onClick={() => { window.location.href = getLoginUrl(); }} size="lg" className="w-full shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground">
            Entrar na Plataforma
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth} expandedGroups={expandedGroups} setExpandedGroups={setExpandedGroups}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = { children: React.ReactNode; setSidebarWidth: (width: number) => void; expandedGroups: Record<string, boolean>; setExpandedGroups: (groups: Record<string, boolean>) => void };

function NavGroup({ label, groupKey, items, location, setLocation, userLayer, isFounder, isExpanded, onToggle }: {
  label: string; groupKey: string; items: MenuItem[]; location: string; setLocation: (path: string) => void; userLayer?: string; isFounder?: boolean; isExpanded: boolean; onToggle: () => void;
}) {
  const filtered = items.filter((item) => canAccess(item, userLayer, isFounder));
  if (filtered.length === 0) return null;

  return (
    <SidebarGroup>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-2 py-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold hover:text-sidebar-foreground/60 transition-colors"
      >
        <span>{label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
      </button>
      {isExpanded && (
        <SidebarMenu className="mt-1">
          {filtered.map((item) => {
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path + "/")) || location.startsWith(item.path);
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton isActive={isActive} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-9 transition-all font-normal">
                  <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-sidebar-foreground/60"}`} />
                  <span className={isActive ? "text-primary font-medium" : ""}>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}

function DashboardLayoutContent({ children, setSidebarWidth, expandedGroups, setExpandedGroups }: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = allMenuItems.find((item) => location.startsWith(item.path));
  const isMobile = useIsMobile();
  const isFounder = user?.role === "admin";
  const userLayer = (user as any)?.layer || "operacional";

  useEffect(() => { if (isCollapsed) setIsResizing(false); }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups({ ...expandedGroups, [groupKey]: !expandedGroups[groupKey] });
  };

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button onClick={toggleSidebar} className="h-8 w-8 flex items-center justify-center hover:bg-sidebar-accent rounded-lg transition-colors focus:outline-none shrink-0" aria-label="Toggle navigation">
                <PanelLeft className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold tracking-tight text-sm text-sidebar-foreground truncate">Máquina de Vendas</span>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-1 px-2">
            <NavGroup label="Estratégia" groupKey="estrategia" items={estrategiaItems} location={location} setLocation={setLocation} userLayer={userLayer} isFounder={isFounder} isExpanded={expandedGroups.estrategia} onToggle={() => toggleGroup("estrategia")} />
            <NavGroup label="Operacional" groupKey="operacional" items={operacionalItems} location={location} setLocation={setLocation} userLayer={userLayer} isFounder={isFounder} isExpanded={expandedGroups.operacional} onToggle={() => toggleGroup("operacional")} />
            <NavGroup label="Analítico" groupKey="analitico" items={analiticoItems} location={location} setLocation={setLocation} userLayer={userLayer} isFounder={isFounder} isExpanded={expandedGroups.analitico} onToggle={() => toggleGroup("analitico")} />
            <NavGroup label="Sistema" groupKey="sistema" items={sistemaItems} location={location} setLocation={setLocation} userLayer={userLayer} isFounder={isFounder} isExpanded={expandedGroups.sistema} onToggle={() => toggleGroup("sistema")} />
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-sidebar-accent transition-colors text-left">
                  <Avatar className="h-8 w-8 border border-sidebar-border shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "V"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-sidebar-foreground">{user?.name || "Usuário"}</p>
                    <p className="text-[11px] text-sidebar-foreground/50 truncate mt-1">{user?.email || ""}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /><span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /><span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => { if (isCollapsed) return; setIsResizing(true); }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b border-border/50 h-14 items-center justify-between bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg" />
              <span className="text-sm font-semibold tracking-tight text-foreground">{activeMenuItem?.label ?? "Máquina de Vendas"}</span>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}

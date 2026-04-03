import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";

// Eager load critical pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

// Lazy load all other pages
const Trail = lazy(() => import("./pages/Trail"));
const Copilot = lazy(() => import("./pages/Copilot"));
const AGC = lazy(() => import("./pages/AGC"));
const CRM = lazy(() => import("./pages/CRM"));
const LeadDetail = lazy(() => import("./pages/LeadDetail"));
const Automations = lazy(() => import("./pages/Automations"));
const WhatsApp = lazy(() => import("./pages/WhatsApp"));
const Admin = lazy(() => import("./pages/Admin"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Settings = lazy(() => import("./pages/Settings"));
const Goals = lazy(() => import("./pages/Goals"));
const KPIs = lazy(() => import("./pages/KPIs"));
const ICP = lazy(() => import("./pages/ICP"));
const Forecast = lazy(() => import("./pages/Forecast"));
const Playbooks = lazy(() => import("./pages/Playbooks"));
const Proposals = lazy(() => import("./pages/Proposals"));
const Products = lazy(() => import("./pages/Products"));
const Projects = lazy(() => import("./pages/Projects"));
const Reports = lazy(() => import("./pages/Reports"));
const DemandGen = lazy(() => import("./pages/DemandGen"));
const PostSales = lazy(() => import("./pages/PostSales"));
const Gamification = lazy(() => import("./pages/Gamification"));
const Methodology = lazy(() => import("./pages/Methodology"));
const SalesAnalytics = lazy(() => import("./pages/SalesAnalytics"));
const CallAnalytics = lazy(() => import("./pages/CallAnalytics"));
const AnalysisHistory = lazy(() => import("./pages/AnalysisHistory"));

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      {children}
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      {/* Estratégia */}
      <Route path="/trail">{() => <LazyPage><Trail /></LazyPage>}</Route>
      <Route path="/goals">{() => <LazyPage><Goals /></LazyPage>}</Route>
      <Route path="/kpis">{() => <LazyPage><KPIs /></LazyPage>}</Route>
      <Route path="/icp">{() => <LazyPage><ICP /></LazyPage>}</Route>
      <Route path="/forecast">{() => <LazyPage><Forecast /></LazyPage>}</Route>
      {/* Operacional */}
      <Route path="/crm" component={CRM} />
      <Route path="/crm/lead/:id">{(params) => <LazyPage><LeadDetail /></LazyPage>}</Route>
      <Route path="/whatsapp">{() => <LazyPage><WhatsApp /></LazyPage>}</Route>
      <Route path="/playbooks">{() => <LazyPage><Playbooks /></LazyPage>}</Route>
      <Route path="/proposals">{() => <LazyPage><Proposals /></LazyPage>}</Route>
      <Route path="/products">{() => <LazyPage><Products /></LazyPage>}</Route>
      <Route path="/projects">{() => <LazyPage><Projects /></LazyPage>}</Route>
      {/* Analítico */}
      <Route path="/agc">{() => <LazyPage><AGC /></LazyPage>}</Route>
      <Route path="/copilot">{() => <LazyPage><Copilot /></LazyPage>}</Route>
      <Route path="/reports">{() => <LazyPage><Reports /></LazyPage>}</Route>
      <Route path="/demand">{() => <LazyPage><DemandGen /></LazyPage>}</Route>
      <Route path="/post-sales">{() => <LazyPage><PostSales /></LazyPage>}</Route>
      <Route path="/gamification">{() => <LazyPage><Gamification /></LazyPage>}</Route>
      {/* Sistema */}
      <Route path="/automations">{() => <LazyPage><Automations /></LazyPage>}</Route>
      <Route path="/onboarding">{() => <LazyPage><Onboarding /></LazyPage>}</Route>
      <Route path="/methodology">{() => <LazyPage><Methodology /></LazyPage>}</Route>
      <Route path="/admin">{() => <LazyPage><Admin /></LazyPage>}</Route>
      <Route path="/sales-analytics">{() => <LazyPage><SalesAnalytics /></LazyPage>}</Route>
      <Route path="/call-analytics">{() => <LazyPage><CallAnalytics /></LazyPage>}</Route>
      <Route path="/analysis-history">{() => <LazyPage><AnalysisHistory /></LazyPage>}</Route>
      <Route path="/settings">{() => <LazyPage><Settings /></LazyPage>}</Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

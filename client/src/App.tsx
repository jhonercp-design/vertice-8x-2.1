import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Trail from "./pages/Trail";
import Copilot from "./pages/Copilot";
import AGC from "./pages/AGC";
import CRM from "./pages/CRM";
import LeadDetail from "./pages/LeadDetail";
import Automations from "./pages/Automations";
import WhatsApp from "./pages/WhatsApp";
import Admin from "./pages/Admin";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/trail" component={Trail} />
      <Route path="/copilot" component={Copilot} />
      <Route path="/agc" component={AGC} />
      <Route path="/crm" component={CRM} />
      <Route path="/crm/lead/:id" component={LeadDetail} />
      <Route path="/automations" component={Automations} />
      <Route path="/whatsapp" component={WhatsApp} />
      <Route path="/admin" component={Admin} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/settings" component={Settings} />
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

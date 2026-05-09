import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import Services from "@/pages/Services";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import WebsiteGenerator from "@/pages/WebsiteGenerator";
import Generate from "@/pages/Generate";
import BusinessAdvisor from "@/pages/BusinessAdvisor";
import ChatbotBuilder from "@/pages/ChatbotBuilder";
import AiPlayground from "@/pages/AiPlayground";
import AdminDashboard from "@/pages/AdminDashboard";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { AiChatWidget } from "@/components/sections/AiChatWidget";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/ai-generator" component={WebsiteGenerator} />
      <Route path="/generate" component={Generate} />
      <Route path="/business-advisor" component={BusinessAdvisor} />
      <Route path="/chatbot-builder" component={ChatbotBuilder} />
      <Route path="/ai-playground" component={AiPlayground} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <AiChatWidget />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

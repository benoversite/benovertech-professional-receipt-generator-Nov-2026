import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateReceipt = lazy(() => import("./pages/CreateReceipt"));
const ReceiptView = lazy(() => import("./pages/ReceiptView"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

type RouteErrorBoundaryState = {
  hasError: boolean;
};

class RouteErrorBoundary extends Component<{ children: ReactNode }, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Page failed to load:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-semibold">This page could not be loaded.</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Try reloading the page. If the problem continues, return home and try again.
          </p>
          <div className="flex gap-3">
            <button className="rounded-xl border px-4 py-2 text-sm" onClick={() => window.location.reload()}>
              Reload page
            </button>
            <a className="rounded-xl bg-gradient-gold px-4 py-2 text-sm font-semibold text-ink" href="/">
              Back home
            </a>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="benovertech-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteErrorBoundary>
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" role="status">
                  Loading page…
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-receipt" element={<CreateReceipt />} />
                <Route path="/receipt/:id" element={<ReceiptView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RouteErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

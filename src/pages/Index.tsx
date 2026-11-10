import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileCheck2, MessageCircle, Sparkles } from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -top-48 right-0 h-[640px] w-[640px] rounded-full bg-gradient-gold opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 h-[640px] w-[640px] rounded-full bg-gradient-purple opacity-25 blur-3xl" />

      <header className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/dashboard">
            <Button variant="ghost" className="h-10 rounded-xl">Open dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-16 pb-24">
        <div className="max-w-3xl animate-fade-up">
          <p className="mb-5 text-sm font-medium text-muted-foreground">Good day, Mr. Ben.</p>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-gold" /> Premium POS · Lagos
          </div>
          <h1 className="display-font mt-6 text-5xl sm:text-7xl font-semibold tracking-[-0.04em] leading-[1.02]">
            Receipts that feel
            <br />
            <span className="gold-text">crafted, not printed.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl">
          The official receipt system for {BUSINESS.name}. Issue Apple-grade sales receipts in seconds, export JPEGs or PDFs, and deliver them directly over WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button className="h-12 rounded-xl bg-gradient-gold text-ink font-semibold hover:opacity-95 shadow-gold px-5">
                Open dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <a href={`tel:${BUSINESS.phone}`} className="inline-flex items-center h-12 px-5 rounded-xl border border-border/60 hover:bg-muted/40 transition text-sm font-medium">
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <Feature icon={<FileCheck2 className="h-4 w-4" />} title="Auto-numbered" body="BNV-YYYY-MM-XXXX numbering with monthly reset." />
          <Feature icon={<Sparkles className="h-4 w-4" />} title="Pixel-perfect PDF" body="Crisp, brand-correct exports ready to print or share." />
          <Feature icon={<MessageCircle className="h-4 w-4" />} title="WhatsApp delivery" body="One tap to send the customer their PDF link." />
        </div>
      </main>
    </div>
  );
};

const Feature = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => (
  <div className="glass rounded-2xl p-5">
    <div className="h-8 w-8 rounded-xl bg-gradient-gold text-ink flex items-center justify-center">{icon}</div>
    <div className="mt-3 font-semibold">{title}</div>
    <div className="mt-1 text-xs text-muted-foreground">{body}</div>
  </div>
);

export default Index;

import { Link } from "react-router-dom";
import { BUSINESS, whatsappLinkForBusiness } from "@/lib/business";
import { Logo } from "@/components/Logo";

export const Footer = () => (
  <footer className="mt-16 border-t border-border/40">
    <div className="container mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
      <div>
        <Logo />
        <p className="mt-3 text-xs text-muted-foreground max-w-xs leading-relaxed">
          Premium gadget retail in Lagos. Issue Apple-style receipts in seconds and share them via WhatsApp.
        </p>
      </div>
      <div className="text-xs text-muted-foreground space-y-1.5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/70">Visit</div>
        <div>{BUSINESS.address}</div>
      </div>
      <div className="text-xs text-muted-foreground space-y-1.5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-foreground/70">Contact</div>
        <a href={whatsappLinkForBusiness()} target="_blank" rel="noreferrer" className="block hover:text-gold transition">
          WhatsApp · {BUSINESS.phone}
        </a>
        <a href={`mailto:${BUSINESS.email}`} className="block hover:text-gold transition">{BUSINESS.email}</a>
      </div>
    </div>
    <div className="container mx-auto px-6 pb-8 flex flex-col sm:flex-row gap-2 items-center justify-between text-[11px] text-muted-foreground/60">
      <div>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</div>
      <Link to="/dashboard" className="hover:text-foreground">Receipt System</Link>
    </div>
  </footer>
);

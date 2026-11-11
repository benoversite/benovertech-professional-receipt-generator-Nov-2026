import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileCheck2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/business";
import "./Index.css";

const Index = () => {
  return (
    <div className="landing-page relative min-h-screen overflow-hidden">
      <div className="landing-ambient landing-ambient-one" aria-hidden="true" />
      <div className="landing-ambient landing-ambient-two" aria-hidden="true" />

      <header className="landing-header container mx-auto flex h-[76px] items-center justify-between px-6">
        <Link to="/" aria-label="BENOVERTECH home" className="landing-brand">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <a className="landing-nav-link" href="#experience">Experience</a>
          <a className="landing-nav-link" href="#details">Details</a>
          <a className="landing-nav-link" href={`tel:${BUSINESS.phone}`}>Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/dashboard">
            <Button className="landing-nav-cta h-10 rounded-full px-4">
              Dashboard <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="landing-hero container mx-auto grid items-center gap-14 px-6 pb-24 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pb-32 lg:pt-16">
          <div className="landing-copy animate-fade-up">
            <div className="landing-kicker">
              <span className="landing-live-dot" />
              <span>BENOVERTECH GADGETS</span>
              <span className="landing-kicker-divider" />
              <span>LAGOS · NIGERIA</span>
            </div>
            <h1 className="landing-headline display-font mt-7 text-[clamp(3.35rem,7.5vw,6.8rem)] font-medium leading-[0.94] tracking-[-0.075em]">
              The final touch
              <br />
              <span className="landing-headline-accent">to every sale.</span>
            </h1>
            <p className="landing-description mt-7 max-w-[530px] text-base leading-7 sm:text-lg sm:leading-8">
              A beautifully considered receipt, made in seconds. Create, save,
              and share every sale with the same care you put into the experience.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/create-receipt">
                <Button className="landing-primary-cta group h-[54px] rounded-full px-6 text-sm font-semibold">
                  Create a receipt
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/dashboard" className="landing-secondary-cta">
                Explore dashboard <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="landing-assurance mt-10 flex items-center gap-3">
              <div className="landing-assurance-icon"><ShieldCheck className="h-4 w-4" /></div>
              <p><span>Made for peace of mind.</span> Your receipts, always within reach.</p>
            </div>
          </div>

          <div className="landing-visual animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="landing-visual-orbit" aria-hidden="true" />
            <div className="landing-preview-label">
              <span className="landing-preview-label-dot" />
              SAMPLE RECEIPT
            </div>
            <article className="landing-receipt">
              <div className="landing-receipt-topline">
                <div>
                  <div className="landing-receipt-brand">BENOVERTECH</div>
                  <div className="landing-receipt-subbrand">G A D G E T S</div>
                </div>
                <span className="landing-receipt-mark"><Check className="h-3.5 w-3.5" /></span>
              </div>
              <div className="landing-receipt-rule" />
              <div className="landing-receipt-meta">
                <div><span>RECEIPT</span><strong>BNV-2026-11-0084</strong></div>
                <div className="text-right"><span>ISSUED</span><strong>11 NOV 2026</strong></div>
              </div>
              <div className="landing-receipt-product">
                <div className="landing-product-art" aria-hidden="true">
                  <div className="landing-product-device" />
                  <div className="landing-product-glow" />
                </div>
                <div className="min-w-0">
                  <span className="landing-product-overline">YOUR PURCHASE</span>
                  <h2>iPhone 16 Pro</h2>
                  <p>Natural Titanium · 256 GB</p>
                </div>
              </div>
              <div className="landing-receipt-rule landing-receipt-dashed" />
              <div className="landing-receipt-customer">
                <div><span>PREPARED FOR</span><strong>Ada Okafor</strong></div>
                <div className="landing-paid-tag"><Check className="h-3 w-3" /> PAID</div>
              </div>
              <div className="landing-receipt-total">
                <span>TOTAL PAID</span>
                <strong>₦2,450,000<span>.00</span></strong>
              </div>
              <div className="landing-receipt-bottom">
                <div className="landing-receipt-seal"><Sparkles className="h-4 w-4" /></div>
                <p>Thank you for choosing<br /><strong>BENOVERTECH GADGETS</strong></p>
                <span className="landing-receipt-bars" aria-hidden="true" />
              </div>
            </article>
            <div className="landing-float-card landing-float-pdf">
              <span className="landing-float-icon"><FileCheck2 className="h-4 w-4" /></span>
              <span><strong>Ready to share</strong><small>PDF · Print · WhatsApp</small></span>
              <Check className="landing-float-check h-4 w-4" />
            </div>
            <div className="landing-float-card landing-float-note">
              <span className="landing-whatsapp-icon"><MessageCircle className="h-4 w-4" /></span>
              <span><strong>One tap away</strong><small>Send directly to WhatsApp</small></span>
            </div>
          </div>
        </section>

        <section id="experience" className="landing-experience">
          <div className="container mx-auto px-6 py-7">
            <div className="landing-capabilities">
              <div className="landing-capabilities-intro">
                <span className="landing-section-index">01 / MADE TO FEEL EFFORTLESS</span>
                <p>From first detail to final delivery.</p>
              </div>
              <div className="landing-capability">
                <span className="landing-capability-icon"><Sparkles className="h-4 w-4" /></span>
                <div><strong>Considered by design</strong><span>Every detail, beautifully in place.</span></div>
              </div>
              <div className="landing-capability">
                <span className="landing-capability-icon"><FileCheck2 className="h-4 w-4" /></span>
                <div><strong>Ready when you are</strong><span>Save or export a crisp PDF.</span></div>
              </div>
              <div className="landing-capability">
                <span className="landing-capability-icon"><MessageCircle className="h-4 w-4" /></span>
                <div><strong>Easy to pass along</strong><span>Share with a single tap.</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="details" className="landing-details container mx-auto flex flex-col gap-5 px-6 py-16 sm:flex-row sm:items-end sm:justify-between sm:py-20">
          <div>
            <span className="landing-section-index">02 / YOUR BUSINESS, IN GOOD HANDS</span>
            <h2 className="display-font mt-3 text-2xl font-medium tracking-[-0.04em] sm:text-3xl">
              Thoughtful tools for <span className="landing-details-accent">better business.</span>
            </h2>
          </div>
          <a href={`tel:${BUSINESS.phone}`} className="landing-contact-link">
            Let’s talk <ArrowUpRight className="h-4 w-4" />
          </a>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container mx-auto flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" aria-label="BENOVERTECH home"><Logo /></Link>
          <p>© {new Date().getFullYear()} {BUSINESS.name}. Made with care in Nigeria.</p>
          <a href="#experience" className="landing-back-top">Back to top <ArrowDown className="h-3.5 w-3.5 rotate-180" /></a>
        </div>
      </footer>
    </div>
  );
};

export default Index;

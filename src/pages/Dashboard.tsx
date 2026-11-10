import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Receipt } from "@/types/receipt";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, formatNGN } from "@/lib/business";
import { getLocalReceipts, isNetworkError } from "@/lib/localReceipts";
import { Plus, Search, FileText, ArrowUpRight, Receipt as ReceiptIcon, Wallet, Calendar } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const localReceipts = getLocalReceipts();
        const { data, error } = await supabase
          .from("receipts")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const merged = new Map<string, Receipt>();
        [...((data ?? []) as Receipt[]), ...localReceipts].forEach((receipt) =>
          merged.set(receipt.id, receipt)
        );
        setReceipts(
          [...merged.values()].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );
      } catch (error) {
        if (isNetworkError(error)) {
          try {
            setReceipts(getLocalReceipts());
            toast.warning("Connection unavailable. Showing receipts saved on this device.");
          } catch (storageError) {
            toast.error(storageError instanceof Error ? storageError.message : "Could not read locally saved receipts.");
          }
        } else {
          toast.error(error instanceof Error ? error.message : "Could not load receipts.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter(
      (r) =>
        r.customer_name.toLowerCase().includes(q) ||
        r.receipt_number.toLowerCase().includes(q) ||
        r.product_name.toLowerCase().includes(q)
    );
  }, [receipts, query]);

  const stats = useMemo(() => {
    const total = receipts.reduce((s, r) => s + Number(r.price), 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthCount = receipts.filter((r) => r.created_at >= monthStart).length;
    const monthSales = receipts
      .filter((r) => r.created_at >= monthStart)
      .reduce((s, r) => s + Number(r.price), 0);
    return { total, count: receipts.length, monthCount, monthSales };
  }, [receipts]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar showCreate />

      <main className="container mx-auto px-6 pt-10 pb-12 flex-1">
        {/* Header */}
        <section className="animate-fade-up">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Dashboard</div>
              <h1 className="display-font mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">
                Good day. <span className="gold-text">Let's issue receipts.</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Premium, branded, and ready to share over WhatsApp in one tap.
              </p>
            </div>
            <Button
              onClick={() => navigate("/create-receipt")}
              className="h-12 rounded-xl bg-gradient-gold text-ink font-semibold hover:opacity-95 shadow-gold px-5"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Create new receipt
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <StatCard icon={<ReceiptIcon className="h-4 w-4" />} label="Total receipts" value={String(stats.count)} />
          <StatCard icon={<Calendar className="h-4 w-4" />} label="This month" value={String(stats.monthCount)} />
          <StatCard icon={<Wallet className="h-4 w-4" />} label="Sales (this month)" value={formatNGN(stats.monthSales)} accent />
        </section>

        {/* List */}
        <section className="mt-10 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <h2 className="display-font text-xl font-semibold tracking-tight">Recent receipts</h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer, product, or #"
                className="h-11 pl-10 input-premium focus-visible:ring-gold"
              />
            </div>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-10 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-gold" />
                <div className="mt-3 text-sm text-muted-foreground">Loading your receipts…</div>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState hasQuery={!!query} />
            ) : (
              <ul className="divide-y divide-border/40">
                {filtered.map((r) => (
                  <li key={r.id} className="receipt-list-item">
                    <Link
                      to={`/receipt/${r.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition group cursor-pointer"
                    >
                      <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-muted/60 ring-1 ring-border/60 transition group-hover:ring-gold/50">
                        {r.product_image_url ? (
                          <img src={r.product_image_url} alt={r.product_name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold truncate text-foreground group-hover:text-gold transition">{r.customer_name}</span>
                          <span className="text-[10px] uppercase tracking-[0.18em] text-gold number-mono font-medium">
                            {r.receipt_number}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {r.product_name} · {formatDate(r.created_at)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="number-mono font-semibold text-foreground">{formatNGN(Number(r.price))}</div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground inline-flex items-center gap-1 mt-0.5 group-hover:text-gold transition">
                          View <ArrowUpRight className="h-3 w-3" />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const StatCard = ({
  icon, label, value, accent,
}: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) => (
  <div className={`stat-card group cursor-default ${accent ? "ring-1 ring-gold/30" : ""}`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">{label}</span>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition ${accent ? "bg-gradient-gold text-ink group-hover:shadow-gold" : "bg-muted/80 text-accent group-hover:bg-muted/90"}`}>
        <span className="text-base">{icon}</span>
      </div>
    </div>
    <div className={`number-mono display-font text-3xl font-bold tracking-tight ${accent ? "gold-text" : "text-foreground"}`}>{value}</div>
    <div className="mt-2 h-0.5 w-0 group-hover:w-12 bg-gradient-gold rounded-full transition-all duration-300" />
  </div>
);

const EmptyState = ({ hasQuery }: { hasQuery: boolean }) => (
  <div className="p-12 text-center">
    <div className="mx-auto h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
      <FileText className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="mt-4 text-base font-semibold">
      {hasQuery ? "No receipts match that search." : "No receipts yet."}
    </h3>
    <p className="mt-1 text-xs text-muted-foreground">
      {hasQuery ? "Try a different name or number." : "Create your first premium receipt to get started."}
    </p>
    {!hasQuery && (
      <Link
        to="/create-receipt"
        className="mt-5 inline-flex h-10 items-center px-4 rounded-xl bg-gradient-gold text-ink font-semibold shadow-gold"
      >
        <Plus className="h-4 w-4 mr-1.5" /> Create receipt
      </Link>
    )}
  </div>
);

export default Dashboard;

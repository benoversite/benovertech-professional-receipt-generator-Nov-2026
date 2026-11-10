import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus } from "lucide-react";

type Props = { showCreate?: boolean };

export const TopBar = ({ showCreate }: Props) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showCreate && (
            <Button
              onClick={() => navigate("/create-receipt")}
              className="hidden sm:inline-flex h-10 rounded-xl bg-gradient-gold text-ink font-semibold hover:opacity-95 shadow-gold"
            >
              <Plus className="h-4 w-4 mr-1" /> New receipt
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "light" | "dark";
  showText?: boolean;
};

export const Logo = ({ className, variant = "light", showText = true }: LogoProps) => {
  const textColor = variant === "light" ? "text-foreground" : "text-ink";
  const subColor = variant === "light" ? "text-muted-foreground" : "text-ink/60";
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <img
        src="/images/benovertech-logo.png"
        alt="BENOVERTECH"
        className="brand-logo-image h-12 w-[88px] shrink-0 object-contain"
      />
      {showText && (
        <div className="leading-none">
          <div className={cn("text-[12px] font-bold tracking-[0.2em]", textColor)}>GADGETS</div>
          <div className={cn("text-[9px] font-medium tracking-[0.16em]", subColor)}>LAGOS</div>
        </div>
      )}
    </div>
  );
};

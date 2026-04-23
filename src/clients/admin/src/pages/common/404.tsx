import { useNavigate } from "react-router-dom";
import { HomeIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex flex-1 min-h-screen items-center justify-center overflow-hidden bg-background"
      style={{
        backgroundImage:
          "radial-gradient(circle, oklch(0.556 0 0 / 0.12) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Ghost number */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-bold text-foreground"
        style={{ fontSize: "clamp(12rem, 40vw, 36rem)", opacity: 0.03, letterSpacing: "-0.05em", lineHeight: 1 }}
      >
        404
      </span>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
        {/* Code chip */}
        <div className="flex items-center gap-2">
          <div className="h-px w-8 bg-border" />
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Error 404
          </span>
          <div className="h-px w-8 bg-border" />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            The page you're looking for doesn't exist, was moved, or you may
            have mistyped the address.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeftIcon data-icon="inline-start" />
            Go back
          </Button>
          <Button onClick={() => navigate("/")}>
            <HomeIcon data-icon="inline-start" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}

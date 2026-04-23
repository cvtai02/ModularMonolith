import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, LogOutIcon, ShieldOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIdentityStore } from "@/stores/identity";
import { ROUTES } from "@/configs/routes";

export default function Unauthorize() {
  const navigate = useNavigate();
  const { logout } = useIdentityStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.signin);
  };

  return (
    <div
      className="relative flex flex-1 min-h-screen items-center justify-center overflow-hidden bg-background"
      style={{
        backgroundImage: `
          linear-gradient(oklch(0.556 0 0 / 0.06) 1px, transparent 1px),
          linear-gradient(90deg, oklch(0.556 0 0 / 0.06) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      {/* Ghost number */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-bold text-destructive"
        style={{ fontSize: "clamp(12rem, 40vw, 36rem)", opacity: 0.04, letterSpacing: "-0.05em", lineHeight: 1 }}
      >
        403
      </span>

      {/* Decorative corner marks */}
      <div aria-hidden className="pointer-events-none absolute inset-8 hidden md:block">
        <div className="absolute top-0 left-0 size-4 border-t border-l border-border/60" />
        <div className="absolute top-0 right-0 size-4 border-t border-r border-border/60" />
        <div className="absolute bottom-0 left-0 size-4 border-b border-l border-border/60" />
        <div className="absolute bottom-0 right-0 size-4 border-b border-r border-border/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
        {/* Icon */}
        <div className="flex size-14 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/8 text-destructive">
          <ShieldOffIcon className="size-6" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-border" />
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Error 403
            </span>
            <div className="h-px w-8 bg-border" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Access denied
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            You don't have permission to view this page. Contact your
            administrator or sign in with a different account.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeftIcon data-icon="inline-start" />
            Go back
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOutIcon data-icon="inline-start" />
            Switch account
          </Button>
        </div>
      </div>
    </div>
  );
}

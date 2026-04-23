import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangleIcon, RefreshCwIcon, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data ?? message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("")}>
            <RefreshCwIcon data-icon="inline-start" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}

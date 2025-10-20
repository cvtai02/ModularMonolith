import { Spinner } from "@/components/ui/spinner";
import { lazy, Suspense, type ComponentType } from "react";

export function LazySection<TProps extends object>(
    importFunc: () => Promise<{ default: ComponentType<TProps> }>
) {
    const LazyComponent = lazy(importFunc);
    
    return (props: TProps) => (
        <Suspense fallback={
            <div className="flex items-center align-middle w-full h-full gap-6">
                <Spinner className="size-8" />
            </div>
        }>
            <LazyComponent {...props} />
        </Suspense>
    );
}
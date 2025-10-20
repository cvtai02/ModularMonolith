import { lazy, Suspense, type ComponentType } from "react";
import { SpinnerPage } from "../ui/spinner-page";

export function LazyPage<TProps extends object>(
    importFunc: () => Promise<{ default: ComponentType<TProps> }>
) {
    const LazyComponent = lazy(importFunc);
    
    return (props: TProps) => (
        <Suspense fallback={
            <SpinnerPage />
        }>
            <LazyComponent {...props} />
        </Suspense>
    );
}
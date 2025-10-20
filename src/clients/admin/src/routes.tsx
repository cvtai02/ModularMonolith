import { Navigate, Route } from "react-router-dom";
import { type ReactNode } from "react";
import AppLayout from "@/components/containers/app-layout";
import { PrivateRoute } from "@/components/containers/private-route";
import { LazyPage } from "@/components/containers/lazy-page";
import { ROUTES } from "@/configs/routes";

// Lazy load all pages
const Signup = LazyPage(() => import("@/pages/signup"));
const Login = LazyPage(() => import("@/pages/login"));
const NotFound = LazyPage(() => import("@/pages/common/404"));
const Dashboard = LazyPage(() => import("@/pages/dashboard"));

function AdminSectionPlaceholder({ title }: { title: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl font-semibold text-balance">{title}</h2>
      <p className="text-sm text-muted-foreground">
        Build this section with filters, table views, and quick actions for daily operations.
      </p>
    </section>
  );
}


const AppRoutes: ReactNode =
  <Route>
    <Route path={ROUTES.root} element={<Navigate to={ROUTES.dashboard} replace />} />

    <Route element={<PrivateRoute />}>
      <Route path={ROUTES.root} element={<AppLayout />}>
        <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminSectionPlaceholder title="Products" />} />
        <Route path="categories" element={<AdminSectionPlaceholder title="Categories" />} />
        <Route path="orders" element={<AdminSectionPlaceholder title="Orders" />} />
        <Route path="customers" element={<AdminSectionPlaceholder title="Customers" />} />
        <Route path="inventory" element={<AdminSectionPlaceholder title="Inventory" />} />
        <Route path="promotions" element={<AdminSectionPlaceholder title="Promotions" />} />
        <Route path="reviews" element={<AdminSectionPlaceholder title="Reviews" />} />
        <Route path="settings" element={<AdminSectionPlaceholder title="Settings" />} />
      </Route>
    </Route>

    <Route path={ROUTES.signin} element={<Login />} />
    <Route path={ROUTES.signup} element={<Signup />} />
    <Route path="*" element={<NotFound />} />
  </Route>

export default AppRoutes;

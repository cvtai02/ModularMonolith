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
const Products = LazyPage(() => import("@/pages/products"));
const Categories = LazyPage(() => import("@/pages/categories"));
const Contents = LazyPage(() => import("@/pages/contents"));
const Orders = LazyPage(() => import("@/pages/orders"));
const Customers = LazyPage(() => import("@/pages/customers"));
const Inventory = LazyPage(() => import("@/pages/inventory"));
const Promotions = LazyPage(() => import("@/pages/promotions"));
const Reviews = LazyPage(() => import("@/pages/reviews"));
const Settings = LazyPage(() => import("@/pages/settings"));

const AppRoutes: ReactNode =
  <Route>
    <Route path={ROUTES.root} element={<Navigate to={ROUTES.dashboard} replace />} />

    <Route element={<PrivateRoute />}>
      <Route path={ROUTES.root} element={<AppLayout />}>
        <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="contents" element={<Contents />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Route>

    <Route path={ROUTES.signin} element={<Login />} />
    <Route path={ROUTES.signup} element={<Signup />} />
    <Route path="*" element={<NotFound />} />
  </Route>

export default AppRoutes;

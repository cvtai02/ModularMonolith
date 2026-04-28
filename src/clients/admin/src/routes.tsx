import { Navigate, Route } from "react-router-dom";
import { type ReactNode } from "react";
import AppLayout from "@/components/containers/app-layout";
import { PrivateRoute } from "@/components/containers/private-route";
import { LazyPage } from "@/components/containers/lazy-page";
import { ROUTES } from "@/configs/routes";
import ErrorPage from "@/pages/common/error";
import Unauthorize from "./pages/common/403";

// Lazy load all pages
const Signup = LazyPage(() => import("@/pages/signup"));
const Login = LazyPage(() => import("@/pages/login"));
const NotFound = LazyPage(() => import("@/pages/common/404"));
// const Dashboard = LazyPage(() => import("@/pages/dashboard"));
const Products = LazyPage(() => import("@/pages/products"));
const AddProduct = LazyPage(() => import("@/pages/products/add"));
const EditProduct = LazyPage(() => import("@/pages/products/edit"));
const Inventory = LazyPage(() => import("@/pages/inventory"));
const Categories = LazyPage(() => import("@/pages/categories"));
const ContentFilesPage = LazyPage(() => import("@/pages/content/files"));
const ContentMenusPage = LazyPage(() => import("@/pages/content/menus"));
const Collections = LazyPage(() => import("@/pages/collections"));
const Orders = LazyPage(() => import("@/pages/orders"));
// const Customers = LazyPage(() => import("@/pages/customers"));
// const Promotions = LazyPage(() => import("@/pages/promotions"));
// const Reviews = LazyPage(() => import("@/pages/reviews"));
// const Settings = LazyPage(() => import("@/pages/settings"));

const AppRoutes: ReactNode =
  <Route>
    <Route path={ROUTES.root} element={<Navigate to={ROUTES.dashboard} replace />} />

    <Route element={<PrivateRoute />}> 
      <Route path={ROUTES.root} element={<AppLayout />}>
        <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
        {/* <Route path={ROUTES.dashboard} element={<Dashboard />} /> */}
        <Route path={ROUTES.products} element={<Products />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.productNew} element={<AddProduct />} errorElement={<ErrorPage />} />
        <Route path="/products/:id/edit" element={<EditProduct />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.productInventory} element={<Inventory />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.productCategory} element={<Categories />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.productCollections} element={<Collections />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.contentFiles} element={<ContentFilesPage />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.contentMenus} element={<ContentMenusPage />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.orders} element={<Orders />} errorElement={<ErrorPage />} />
        {/* <Route path={ROUTES.customers} element={<Customers />} errorElement={<ErrorPage />} /> */}
        {/* <Route path={ROUTES.promotions} element={<Promotions />} errorElement={<ErrorPage />} /> */}
        {/* <Route path={ROUTES.reviews} element={<Reviews />} errorElement={<ErrorPage />} /> */}
        {/* <Route path={ROUTES.settings} element={<Settings />} errorElement={<ErrorPage />} /> */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>

    <Route path={ROUTES.signin} element={<Login />} />
    <Route path={ROUTES.signup} element={<Signup />} />
    <Route path={ROUTES.notAuthorized} element={<Unauthorize />} />
  </Route>

export default AppRoutes;

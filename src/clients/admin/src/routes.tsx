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
const ViewProduct = LazyPage(() => import("@/pages/products/view"));
const Categories = LazyPage(() => import("@/pages/categories"));
const ContentFilesPage = LazyPage(() => import("@/pages/content/files"));
const Inventory = LazyPage(() => import("@/pages/products/inventory"));
const Collections = LazyPage(() => import("@/pages/collections"));
const AddCollection = LazyPage(() => import("@/pages/collections/add"));
const EditCollection = LazyPage(() => import("@/pages/collections/edit"));
const Customers = LazyPage(() => import("@/pages/customers"));
// const Promotions = LazyPage(() => import("@/pages/promotions"));
// const Reviews = LazyPage(() => import("@/pages/reviews"));
// const Settings = LazyPage(() => import("@/pages/settings"));

const AppRoutes: ReactNode =
  <Route errorElement={<ErrorPage />}>
    <Route path={ROUTES.root} element={<Navigate to={ROUTES.dashboard} replace />} />

    <Route element={<PrivateRoute />}>
      <Route path={ROUTES.root} element={<AppLayout />}>
        <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
        {/* <Route path={ROUTES.dashboard} element={<Dashboard />} /> */}
        <Route path={ROUTES.products} element={<Products />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.productNew} element={<AddProduct />} errorElement={<ErrorPage />} />
        <Route path="/products/:id" element={<ViewProduct />} errorElement={<ErrorPage />} />
        <Route path="/products/:id/edit" element={<EditProduct />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.productInventory} element={<Inventory />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.productCategory} element={<Categories />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.productCollections} element={<Collections />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.collectionNew} element={<AddCollection />} errorElement={<ErrorPage />} />
        <Route path="/products/collections/:id/edit" element={<EditCollection />} errorElement={<ErrorPage />} />
        <Route path={ROUTES.contentFiles} element={<ContentFilesPage />} errorElement={<ErrorPage />} />
        {/* <Route path={ROUTES.orders} element={<Orders />} /> */}
        <Route path={ROUTES.customers} element={<Customers />} errorElement={<ErrorPage />} />
        {/* <Route path={ROUTES.promotions} element={<Promotions />} /> */}
        {/* <Route path={ROUTES.reviews} element={<Reviews />} /> */}
        {/* <Route path={ROUTES.settings} element={<Settings />} /> */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>

    <Route path={ROUTES.signin} element={<Login />} />
    <Route path={ROUTES.signup} element={<Signup />} />
    <Route path={ROUTES.notAuthorized} element={<Unauthorize />} />
  </Route>

export default AppRoutes;

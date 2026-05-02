/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  AccountClient,
  ContentClient,
  IdentityClient,
  InventoryClient,
  OrderClient,
  PaymentClient,
  ProductCatalogClient,
} from "@shared/api/clients";
import type {
  IAccountClient,
  IContentClient,
  IIdentityClient,
  IInventoryClient,
  IOrderClient,
  IPaymentClient,
  IProductCatalogClient,
} from "@shared/api/contracts";
import { appFetch } from "@/configs/appFetch";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const API_IDENTITY_URL = import.meta.env.VITE_API_IDENTITY_URL as string;

type ApiClients = {
  account: IAccountClient;
  content: IContentClient;
  identity: IIdentityClient;
  inventory: IInventoryClient;
  order: IOrderClient;
  payment: IPaymentClient;
  productCatalog: IProductCatalogClient;
};

const ApiClientContext = createContext<ApiClients | null>(null);

export function ApiClientProvider({ children }: { children: ReactNode }) {
  const clients = useMemo<ApiClients>(
    () => ({
      account: new AccountClient(appFetch, API_BASE_URL),
      content: new ContentClient(appFetch, API_BASE_URL),
      identity: new IdentityClient(appFetch, API_IDENTITY_URL),
      inventory: new InventoryClient(appFetch, API_BASE_URL),
      order: new OrderClient(appFetch, API_BASE_URL),
      payment: new PaymentClient(appFetch, API_BASE_URL),
      productCatalog: new ProductCatalogClient(appFetch, API_BASE_URL),
    }),
    []
  );

  return <ApiClientContext.Provider value={clients}>{children}</ApiClientContext.Provider>;
}

function useApiClients(): ApiClients {
  const ctx = useContext(ApiClientContext);
  if (!ctx) throw new Error("useApiClients must be used inside ApiClientProvider");
  return ctx;
}

export const useAccountClient = () => useApiClients().account;
export const useContentClient = () => useApiClients().content;
export const useIdentityClient = () => useApiClients().identity;
export const useInventoryClient = () => useApiClients().inventory;
export const useOrderClient = () => useApiClients().order;
export const usePaymentClient = () => useApiClients().payment;
export const useProductCatalogClient = () => useApiClients().productCatalog;

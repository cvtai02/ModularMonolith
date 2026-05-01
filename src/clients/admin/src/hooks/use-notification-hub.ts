import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useIdentityStore } from "@/stores/identity";

export type OrderPlacedNotification = {
  type: "OrderPlaced";
  orderId: number;
  orderCode: string;
  customerId?: string | null;
  totalAmount: number;
  currencyCode: string;
  reservationId: number;
  status: string;
  createdAt: string;
};

export type AdminNotification = OrderPlacedNotification;

const HUB_URL = "/hubs/notifications";

export function useNotificationHub() {
  const accessToken = useIdentityStore((s) => s.accessToken);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("NotificationReceived", (payload: AdminNotification) => {
      setNotifications((prev) => [payload, ...prev]);
    });

    connection.start().catch(() => {});

    connectionRef.current = connection;
    return () => {
      connection.stop();
    };
  }, [accessToken]);

  const clearAll = () => setNotifications([]);

  return { notifications, clearAll };
}

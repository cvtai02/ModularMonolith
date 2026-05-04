"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as SignalR from "@microsoft/signalr";

import { ORDER_HUB_URL, notificationKey } from "@/app/lib/order-hub";
import type { OrderNotification } from "@/app/lib/order-hub";
import { getAccessToken } from "@/app/lib/auth";

const MAX_NOTIFICATIONS = 50;

export function useMyOrdersHub(
  onNotification?: (notification: OrderNotification) => void,
) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const seenKeys = useRef(new Set<string>());
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  const addNotification = useCallback((n: OrderNotification) => {
    const key = notificationKey(n);
    if (seenKeys.current.has(key)) return;
    seenKeys.current.add(key);
    setNotifications((prev) => [n, ...prev].slice(0, MAX_NOTIFICATIONS));
    onNotificationRef.current?.(n);
  }, []);

  useEffect(() => {
    let mounted = true;
    let connection: SignalR.HubConnection | null = null;

    async function start() {
      const token = await getAccessToken();
      if (!token || !mounted) return;

      connection = new SignalR.HubConnectionBuilder()
        .withUrl(ORDER_HUB_URL, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .configureLogging(SignalR.LogLevel.Warning)
        .build();

      connection.on("OrderNotification", addNotification);
      connection.on("OrderPlaced", addNotification);

      try {
        await connection.start();
        if (!mounted) { await connection.stop(); return; }
        await connection.invoke("JoinMyOrders");
      } catch {
        // Auth failure or server unreachable — no-op, component stays quiet.
      }
    }

    start();

    return () => {
      mounted = false;
      if (connection) {
        connection.invoke("LeaveMyOrders").catch(() => {});
        connection.stop().catch(() => {});
      }
    };
  }, [addNotification]);

  const clear = useCallback(() => {
    seenKeys.current.clear();
    setNotifications([]);
  }, []);

  return { notifications, clear };
}

"use client";

import { useRef, useState } from "react";

import { useMyOrdersHub } from "@/app/hooks/use-my-orders-hub";
import { notificationMessage } from "@/app/lib/order-hub";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notifications, clear } = useMyOrdersHub();
  const panelRef = useRef<HTMLDivElement>(null);
  const unread = notifications.length;

  if (unread === 0 && !open) {
    return (
      <button
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
        onClick={() => setOpen(true)}
      >
        <BellIcon className="size-5 text-zinc-600" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        aria-label={`Notifications (${unread} unread)`}
        className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon className="size-5 text-zinc-600" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold leading-none text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-zinc-200 bg-white shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <span className="text-sm font-semibold text-zinc-800">Notifications</span>
              {unread > 0 && (
                <button
                  onClick={clear}
                  className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-400">
                No notifications yet.
              </p>
            ) : (
              <ul className="max-h-96 overflow-y-auto divide-y divide-zinc-100">
                {notifications.map((n) => (
                  <li
                    key={`${n.type}-${n.orderCode}-${n.occurredAt}`}
                    className="px-4 py-3"
                  >
                    <p className="text-sm text-zinc-800">{notificationMessage(n)}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {new Date(n.occurredAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

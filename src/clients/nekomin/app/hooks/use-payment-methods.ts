"use client";

import { useEffect, useState } from "react";

import { usePaymentClient } from "@/app/components/api-client-provider";
import type { IPaymentClient } from "@modular-monolith/clients-shared/api/contracts";

export type PaymentMethod = Awaited<ReturnType<IPaymentClient["listPaymentMethods"]>>[number];

type State = {
  methods: PaymentMethod[];
  loading: boolean;
  error: string | null;
};

export function usePaymentMethods(): State {
  const paymentClient = usePaymentClient();
  const [state, setState] = useState<State>({ methods: [], loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    paymentClient
      .listPaymentMethods()
      .then((res) => {
        if (!mounted) return;
        setState({ methods: res ?? [], loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Failed to load payment methods";
        setState({ methods: [], loading: false, error: message });
      });
    return () => {
      mounted = false;
    };
  }, [paymentClient]);

  return state;
}

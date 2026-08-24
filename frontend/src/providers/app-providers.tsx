"use client";

import { TransactionProvider } from "@/providers/transaction-provider";
import { WalletProvider } from "@/providers/wallet-provider";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 3_000,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 2,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider
        client={queryClient}
      >
        <WalletProvider>
          <TransactionProvider>
            {children}
          </TransactionProvider>
        </WalletProvider>

        <Toaster
          richColors
          closeButton
          position="bottom-right"
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

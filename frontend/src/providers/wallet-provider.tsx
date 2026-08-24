"use client";

import {
  type BrowserWalletProvider,
  createWriteClient,
} from "@/lib/genlayer/client";
import {
  GENLAYER_CHAIN_ID,
} from "@/lib/contract/config";
import {
  testnetBradbury,
} from "genlayer-js/chains";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

const PROVIDER_PREFERENCE_KEY =
  "policydelta:wallet-provider:v1";

type WalletStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error";

type ProviderWithEvents =
  BrowserWalletProvider & {
    on?: (
      event: string,
      listener: (
        value: unknown,
      ) => void,
    ) => void;

    removeListener?: (
      event: string,
      listener: (
        value: unknown,
      ) => void,
    ) => void;
  };

type ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

type ProviderDetail = {
  info: ProviderInfo;
  provider: ProviderWithEvents;
};

export type WalletProviderOption = {
  id: string;
  name: string;
  rdns: string;
};

type WalletContextValue = {
  address:
    | `0x${string}`
    | null;

  chainId:
    | number
    | null;

  status: WalletStatus;

  hasProvider: boolean;

  isBradbury: boolean;

  walletOptions:
    WalletProviderOption[];

  selectedProviderId:
    | string
    | null;

  selectedProviderName:
    | string
    | null;

  connect:
    (
      providerId?: string,
    ) => Promise<void>;

  selectProvider:
    (
      providerId: string,
    ) => void;

  ensureBradbury:
    () => Promise<void>;

  prepareWriteClient:
    () => Promise<
      ReturnType<
        typeof createWriteClient
      >
    >;
};

const WalletContext =
  createContext<
    WalletContextValue | null
  >(null);

function parseChainId(
  value: unknown,
) {
  if (
    typeof value === "string"
  ) {
    const parsed =
      Number.parseInt(
        value,
        16,
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : null;
  }

  if (
    typeof value === "number"
  ) {
    return value;
  }

  return null;
}

function firstAddress(
  value: unknown,
):
  | `0x${string}`
  | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const first =
    value.find(
      (
        item,
      ): item is string =>
        typeof item ===
          "string" &&
        /^0x[a-fA-F0-9]{40}$/.test(
          item,
        ),
    );

  return first
    ? (
        first as `0x${string}`
      )
    : null;
}

function providerErrorCode(
  error: unknown,
) {
  if (
    !error ||
    typeof error !== "object"
  ) {
    return null;
  }

  const code =
    (
      error as {
        code?: unknown;
      }
    ).code;

  if (
    typeof code === "number"
  ) {
    return code;
  }

  if (
    typeof code === "string"
  ) {
    const parsed =
      Number(code);

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : null;
  }

  return null;
}

function legacyProviderName(
  provider:
    BrowserWalletProvider,
) {
  const flags =
    provider as unknown as
      Record<
        string,
        unknown
      >;

  if (
    flags.isMetaMask === true
  ) {
    return "MetaMask";
  }

  if (
    flags.isRabby === true
  ) {
    return "Rabby";
  }

  if (
    flags.isBackpack === true
  ) {
    return "Backpack";
  }

  return "Browser wallet";
}

function legacyDetail(
  provider:
    BrowserWalletProvider,
): ProviderDetail {
  const name =
    legacyProviderName(
      provider,
    );

  return {
    info: {
      uuid:
        "legacy-window-ethereum",
      name,
      icon: "",
      rdns:
        `legacy.${name
          .toLowerCase()
          .replaceAll(
            " ",
            "-",
          )}`,
    },
    provider:
      provider as ProviderWithEvents,
  };
}

function validProviderDetail(
  value: unknown,
): value is ProviderDetail {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const detail =
    value as {
      info?: unknown;
      provider?: unknown;
    };

  if (
    !detail.info ||
    typeof detail.info !==
      "object" ||
    !detail.provider ||
    typeof detail.provider !==
      "object"
  ) {
    return false;
  }

  const info =
    detail.info as Record<
      string,
      unknown
    >;

  const provider =
    detail.provider as Record<
      string,
      unknown
    >;

  return (
    typeof info.uuid ===
      "string" &&
    typeof info.name ===
      "string" &&
    typeof info.rdns ===
      "string" &&
    typeof provider.request ===
      "function"
  );
}

async function switchToBradbury(
  provider:
    BrowserWalletProvider,
) {
  const expectedHex =
    `0x${GENLAYER_CHAIN_ID.toString(
      16,
    )}`;

  const rawCurrent =
    await provider.request({
      method: "eth_chainId",
    });

  if (
    parseChainId(
      rawCurrent,
    ) ===
    GENLAYER_CHAIN_ID
  ) {
    return;
  }

  try {
    await provider.request({
      method:
        "wallet_switchEthereumChain",
      params: [
        {
          chainId:
            expectedHex,
        },
      ],
    });
  } catch (error) {
    if (
      providerErrorCode(
        error,
      ) !== 4902
    ) {
      throw error;
    }

    await provider.request({
      method:
        "wallet_addEthereumChain",
      params: [
        {
          chainId:
            expectedHex,
          chainName:
            testnetBradbury.name,
          rpcUrls:
            testnetBradbury
              .rpcUrls
              .default
              .http,
          nativeCurrency:
            testnetBradbury
              .nativeCurrency,
          blockExplorerUrls:
            testnetBradbury
              .blockExplorers
              ?.default
              ?.url
              ? [
                  testnetBradbury
                    .blockExplorers
                    .default
                    .url,
                ]
              : [],
        },
      ],
    });

    await provider.request({
      method:
        "wallet_switchEthereumChain",
      params: [
        {
          chainId:
            expectedHex,
        },
      ],
    });
  }

  const confirmed =
    parseChainId(
      await provider.request({
        method:
          "eth_chainId",
      }),
    );

  if (
    confirmed !==
    GENLAYER_CHAIN_ID
  ) {
    throw new Error(
      `Wallet is on chain ${confirmed ?? "unknown"}, not Bradbury (${GENLAYER_CHAIN_ID}).`,
    );
  }
}

export function WalletProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const [
    providerDetails,
    setProviderDetails,
  ] =
    useState<
      ProviderDetail[]
    >([]);

  const [
    discoveryComplete,
    setDiscoveryComplete,
  ] =
    useState(false);

  const [
    selectedProviderId,
    setSelectedProviderId,
  ] =
    useState<
      string | null
    >(null);

  const [
    address,
    setAddress,
  ] =
    useState<
      `0x${string}` | null
    >(null);

  const [
    chainId,
    setChainId,
  ] =
    useState<
      number | null
    >(null);

  const [
    status,
    setStatus,
  ] =
    useState<WalletStatus>(
      "idle",
    );

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    let active = true;

    function registerProvider(
      detail:
        ProviderDetail,
    ) {
      if (!active) {
        return;
      }

      setProviderDetails(
        (current) => {
          const sameProvider =
            current.findIndex(
              (item) =>
                item.provider ===
                detail.provider,
            );

          if (
            sameProvider >= 0
          ) {
            const existing =
              current[
                sameProvider
              ];

            if (
              existing.info.rdns
                .startsWith(
                  "legacy.",
                ) &&
              !detail.info.rdns
                .startsWith(
                  "legacy.",
                )
            ) {
              const next =
                [...current];

              next[
                sameProvider
              ] = detail;

              return next;
            }

            return current;
          }

          if (
            current.some(
              (item) =>
                item.info.uuid ===
                detail.info.uuid,
            )
          ) {
            return current;
          }

          return [
            ...current,
            detail,
          ];
        },
      );
    }

    const browser =
      window as typeof window & {
        ethereum?:
          BrowserWalletProvider;
      };

    if (
      browser.ethereum
    ) {
      registerProvider(
        legacyDetail(
          browser.ethereum,
        ),
      );
    }

    const announce =
      (
        event: Event,
      ) => {
        const detail =
          (
            event as CustomEvent<
              unknown
            >
          ).detail;

        if (
          validProviderDetail(
            detail,
          )
        ) {
          registerProvider(
            detail,
          );
        }
      };

    window.addEventListener(
      "eip6963:announceProvider",
      announce,
    );

    window.dispatchEvent(
      new Event(
        "eip6963:requestProvider",
      ),
    );

    const timer =
      window.setTimeout(
        () => {
          if (active) {
            setDiscoveryComplete(
              true,
            );
          }
        },
        180,
      );

    return () => {
      active = false;

      window.clearTimeout(
        timer,
      );

      window.removeEventListener(
        "eip6963:announceProvider",
        announce,
      );
    };
  }, []);

  useEffect(() => {
    if (
      !discoveryComplete ||
      selectedProviderId ||
      providerDetails.length ===
        0
    ) {
      return;
    }

    let active = true;

    const preferredRdns =
      window.localStorage.getItem(
        PROVIDER_PREFERENCE_KEY,
      );

    const preferred =
      preferredRdns
        ? providerDetails.find(
            (detail) =>
              detail.info.rdns ===
              preferredRdns,
          )
        : undefined;

    function selectAutomatically(
      detail: ProviderDetail,
    ) {
      queueMicrotask(() => {
        if (!active) {
          return;
        }

        setSelectedProviderId(
          detail.info.uuid,
        );

        window.localStorage.setItem(
          PROVIDER_PREFERENCE_KEY,
          detail.info.rdns,
        );
      });
    }

    if (preferred) {
      selectAutomatically(
        preferred,
      );

      return () => {
        active = false;
      };
    }

    if (
      providerDetails.length ===
      1
    ) {
      selectAutomatically(
        providerDetails[0],
      );

      return () => {
        active = false;
      };
    }

    void Promise.all(
      providerDetails.map(
        async (detail) => {
          try {
            const accounts =
              await detail.provider.request(
                {
                  method:
                    "eth_accounts",
                },
              );

            return firstAddress(
              accounts,
            )
              ? detail
              : null;
          } catch {
            return null;
          }
        },
      ),
    ).then(
      (connected) => {
        if (!active) {
          return;
        }

        const available =
          connected.filter(
            (
              detail,
            ): detail is ProviderDetail =>
              detail !== null,
          );

        if (
          available.length ===
          1
        ) {
          const only =
            available[0];

          setSelectedProviderId(
            only.info.uuid,
          );

          window.localStorage.setItem(
            PROVIDER_PREFERENCE_KEY,
            only.info.rdns,
          );
        }
      },
    );

    return () => {
      active = false;
    };
  }, [
    discoveryComplete,
    providerDetails,
    selectedProviderId,
  ]);

  const selectedDetail =
    useMemo(
      () =>
        providerDetails.find(
          (detail) =>
            detail.info.uuid ===
            selectedProviderId,
        ) ?? null,
      [
        providerDetails,
        selectedProviderId,
      ],
    );

  const syncProvider =
    useCallback(
      async (
        detail:
          ProviderDetail,
      ) => {
        const accounts =
          await detail.provider.request(
            {
              method:
                "eth_accounts",
            },
          );

        const nextAddress =
          firstAddress(
            accounts,
          );

        const nextChainId =
          parseChainId(
            await detail.provider.request(
              {
                method:
                  "eth_chainId",
              },
            ),
          );

        setAddress(
          nextAddress,
        );

        setChainId(
          nextChainId,
        );

        setStatus(
          nextAddress
            ? "connected"
            : "idle",
        );
      },
      [],
    );

  useEffect(() => {
    if (!selectedDetail) {
      return;
    }

    let active = true;

    queueMicrotask(() => {
      if (!active) {
        return;
      }

      void syncProvider(
        selectedDetail,
      ).catch(() => {
        if (active) {
          setStatus("idle");
        }
      });
    });

    const eventProvider =
      selectedDetail.provider;

    const handleAccountsChanged =
      (
        value: unknown,
      ) => {
        if (!active) {
          return;
        }

        const next =
          firstAddress(
            value,
          );

        setAddress(next);

        setStatus(
          next
            ? "connected"
            : "idle",
        );
      };

    const handleChainChanged =
      (
        value: unknown,
      ) => {
        if (!active) {
          return;
        }

        setChainId(
          parseChainId(
            value,
          ),
        );
      };

    eventProvider.on?.(
      "accountsChanged",
      handleAccountsChanged,
    );

    eventProvider.on?.(
      "chainChanged",
      handleChainChanged,
    );

    return () => {
      active = false;

      eventProvider
        .removeListener?.(
          "accountsChanged",
          handleAccountsChanged,
        );

      eventProvider
        .removeListener?.(
          "chainChanged",
          handleChainChanged,
        );
    };
  }, [
    selectedDetail,
    syncProvider,
  ]);

  const selectProvider =
    useCallback(
      (
        providerId: string,
      ) => {
        const detail =
          providerDetails.find(
            (item) =>
              item.info.uuid ===
              providerId,
          );

        if (!detail) {
          return;
        }

        setSelectedProviderId(
          providerId,
        );

        setAddress(null);
        setChainId(null);
        setStatus("idle");

        window.localStorage.setItem(
          PROVIDER_PREFERENCE_KEY,
          detail.info.rdns,
        );
      },
      [providerDetails],
    );

  const connect =
    useCallback(
      async (
        providerId?: string,
      ) => {
        const detail =
          (
            providerId
              ? providerDetails.find(
                  (item) =>
                    item.info.uuid ===
                    providerId,
                )
              : selectedDetail
          ) ??
          (
            providerDetails.length ===
              1
              ? providerDetails[0]
              : null
          );

        if (!detail) {
          const message =
            providerDetails.length >
            1
              ? "Choose which browser wallet PolicyDelta should use."
              : "No compatible browser wallet was detected.";

          toast.error(
            message,
          );

          setStatus(
            "error",
          );

          throw new Error(
            message,
          );
        }

        setSelectedProviderId(
          detail.info.uuid,
        );

        window.localStorage.setItem(
          PROVIDER_PREFERENCE_KEY,
          detail.info.rdns,
        );

        setStatus(
          "connecting",
        );

        try {
          const accounts =
            await detail.provider.request(
              {
                method:
                  "eth_requestAccounts",
              },
            );

          const nextAddress =
            firstAddress(
              accounts,
            );

          if (!nextAddress) {
            throw new Error(
              "The selected wallet did not return an account.",
            );
          }

          await switchToBradbury(
            detail.provider,
          );

          const confirmedAccounts =
            await detail.provider.request(
              {
                method:
                  "eth_accounts",
              },
            );

          const confirmedAddress =
            firstAddress(
              confirmedAccounts,
            );

          if (
            !confirmedAddress ||
            confirmedAddress.toLowerCase() !==
              nextAddress.toLowerCase()
          ) {
            throw new Error(
              "The wallet account changed during connection. Reconnect before continuing.",
            );
          }

          const confirmedChainId =
            parseChainId(
              await detail.provider.request(
                {
                  method:
                    "eth_chainId",
                },
              ),
            );

          if (
            confirmedChainId !==
            GENLAYER_CHAIN_ID
          ) {
            throw new Error(
              `Wallet is on chain ${confirmedChainId ?? "unknown"}, not Bradbury (${GENLAYER_CHAIN_ID}).`,
            );
          }

          setAddress(
            confirmedAddress,
          );

          setChainId(
            confirmedChainId,
          );

          setStatus(
            "connected",
          );

          toast.success(
            `${detail.info.name} connected to Bradbury.`,
          );
        } catch (error) {
          setStatus(
            "error",
          );

          const message =
            error instanceof Error
              ? error.message
              : "Wallet connection failed.";

          toast.error(
            message,
          );

          throw error;
        }
      },
      [
        providerDetails,
        selectedDetail,
      ],
    );

  const ensureBradbury =
    useCallback(
      async () => {
        if (
          !selectedDetail ||
          !address
        ) {
          throw new Error(
            "Connect a browser wallet first.",
          );
        }

        await switchToBradbury(
          selectedDetail.provider,
        );

        const nextChainId =
          parseChainId(
            await selectedDetail
              .provider
              .request({
                method:
                  "eth_chainId",
              }),
          );

        setChainId(
          nextChainId,
        );

        if (
          nextChainId !==
          GENLAYER_CHAIN_ID
        ) {
          throw new Error(
            `Wallet is on chain ${nextChainId ?? "unknown"}, not Bradbury (${GENLAYER_CHAIN_ID}).`,
          );
        }
      },
      [
        address,
        selectedDetail,
      ],
    );

  const prepareWriteClient =
    useCallback(
      async () => {
        if (
          !selectedDetail ||
          !address
        ) {
          throw new Error(
            "Connect a browser wallet before submitting a PolicyDelta transaction.",
          );
        }

        const currentChainId =
          parseChainId(
            await selectedDetail
              .provider
              .request({
                method:
                  "eth_chainId",
              }),
          );

        if (
          currentChainId !==
          GENLAYER_CHAIN_ID
        ) {
          throw new Error(
            `Wallet is on chain ${currentChainId ?? "unknown"}, not Bradbury (${GENLAYER_CHAIN_ID}).`,
          );
        }

        const accounts =
          await selectedDetail
            .provider
            .request({
              method:
                "eth_accounts",
            });

        const currentAddress =
          firstAddress(
            accounts,
          );

        if (
          !currentAddress ||
          currentAddress.toLowerCase() !==
            address.toLowerCase()
        ) {
          throw new Error(
            "The selected wallet account changed. Reconnect before submitting this transaction.",
          );
        }

        return createWriteClient(
          address,
          selectedDetail.provider,
        );
      },
      [
        address,
        selectedDetail,
      ],
    );

  const walletOptions =
    useMemo<
      WalletProviderOption[]
    >(
      () =>
        providerDetails.map(
          (detail) => ({
            id:
              detail.info.uuid,
            name:
              detail.info.name,
            rdns:
              detail.info.rdns,
          }),
        ),
      [providerDetails],
    );

  const value =
    useMemo<
      WalletContextValue
    >(
      () => ({
        address,
        chainId,
        status,
        hasProvider:
          providerDetails.length >
          0,
        isBradbury:
          chainId ===
          GENLAYER_CHAIN_ID,
        walletOptions,
        selectedProviderId,
        selectedProviderName:
          selectedDetail
            ?.info
            .name ?? null,
        connect,
        selectProvider,
        ensureBradbury,
        prepareWriteClient,
      }),
      [
        address,
        chainId,
        status,
        providerDetails.length,
        walletOptions,
        selectedProviderId,
        selectedDetail,
        connect,
        selectProvider,
        ensureBradbury,
        prepareWriteClient,
      ],
    );

  return (
    <WalletContext.Provider
      value={value}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context =
    useContext(
      WalletContext,
    );

  if (!context) {
    throw new Error(
      "useWallet must be used inside WalletProvider.",
    );
  }

  return context;
}

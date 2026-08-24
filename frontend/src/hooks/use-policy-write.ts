"use client";

import { POLICY_DELTA_ADDRESS } from "@/lib/contract/config";
import { createWriteClient } from "@/lib/genlayer/client";
import { useTransactions } from "@/providers/transaction-provider";
import { useWallet } from "@/providers/wallet-provider";
import { useCallback } from "react";
import { toast } from "sonner";

type WriteContractInput =
  Parameters<
    ReturnType<typeof createWriteClient>["writeContract"]
  >[0];

type WriteContractArgs =
  WriteContractInput["args"];

type SubmitWriteInput = {
  functionName:
    | "create_policy"
    | "propose_version"
    | "review_version"
    | "consent_to_version"
    | "reject_version"
    | "recover_expired_version";
  args: WriteContractArgs;
  title: string;
  policyId?: string;
  version?: number;
};

export function usePolicyWrite() {
  const {
    address,
    isBradbury,
    ensureBradbury,
    prepareWriteClient,
  } = useWallet();

  const { trackTransaction } =
    useTransactions();

  const submitWrite = useCallback(
    async ({
      functionName,
      args,
      title,
      policyId,
      version,
    }: SubmitWriteInput) => {
      if (!address) {
        const message =
          "Connect your wallet before submitting a PolicyDelta transaction.";

        toast.error(message);
        throw new Error(message);
      }

      try {
        if (!isBradbury) {
          await ensureBradbury();
        }

        const verifiedWriteClient =
          await prepareWriteClient();

        const hash =
          await verifiedWriteClient.writeContract({
            address:
              POLICY_DELTA_ADDRESS,
            functionName,
            args,
            value: BigInt(0),
          });

        trackTransaction({
          hash,
          title,
          functionName,
          policyId,
          version,
        });

        return hash;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "The transaction could not be submitted.";

        toast.error(message);
        throw error;
      }
    },
    [
      address,
      ensureBradbury,
      isBradbury,
      prepareWriteClient,
      trackTransaction,
    ],
  );

  return {
    address,
    canWrite:
      Boolean(address),
    submitWrite,
  };
}

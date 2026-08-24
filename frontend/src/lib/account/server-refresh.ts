import {
  policyRoleForWallet,
  verifyPolicyDeltaTransaction,
} from "@/lib/account/server-verification";
import {
  accountDatabaseConfigured,
  readWalletActivityNeedingRefresh,
  upsertWalletActivity,
  upsertWalletPolicy,
} from "@/lib/server/db";

export async function refreshWalletActivityFromBradbury(
  wallet: string,
) {
  if (!accountDatabaseConfigured()) {
    return;
  }

  const candidates =
    await readWalletActivityNeedingRefresh(
      wallet,
    );

  await Promise.allSettled(
    candidates.map(
      async ({ hash }) => {
        const verified =
          await verifyPolicyDeltaTransaction(
            {
              wallet,
              hash,
            },
          );

        if (
          !verified
            .metadataVerified ||
          !verified.policyId
        ) {
          return;
        }

        await upsertWalletActivity({
          hash,
          wallet,
          functionName:
            verified.functionName,
          policyId:
            verified.policyId,
          version:
            verified.version,
          consensusStatus:
            verified
              .consensusStatus,
          executionStatus:
            verified
              .executionStatus,
          methodVerified: true,
        });

        if (
          !verified
            .finalizedSuccess
        ) {
          return;
        }

        const role =
          await policyRoleForWallet(
            wallet,
            verified.policyId,
          );

        if (role) {
          await upsertWalletPolicy(
            wallet,
            verified.policyId,
            role,
          );
        }
      },
    ),
  );
}

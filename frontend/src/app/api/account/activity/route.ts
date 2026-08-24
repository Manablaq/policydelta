import {
  normalizeWallet,
  validHash,
} from "@/lib/account/validation";
import {
  policyRoleForWallet,
  verifyPolicyDeltaTransaction,
} from "@/lib/account/server-verification";
import {
  accountDatabaseConfigured,
  readWalletAccount,
  upsertWalletActivity,
  upsertWalletPolicy,
} from "@/lib/server/db";
import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function POST(
  request: NextRequest,
) {
  if (
    !accountDatabaseConfigured()
  ) {
    return NextResponse.json({
      configured: false,
    });
  }

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const data =
    body &&
    typeof body ===
      "object" &&
    !Array.isArray(body)
      ? body as Record<
          string,
          unknown
        >
      : {};

  const wallet =
    normalizeWallet(
      typeof data.wallet ===
        "string"
        ? data.wallet
        : "",
    );

  const hash =
    typeof data.hash ===
      "string"
      ? data.hash.trim()
      : "";

  if (
    !wallet ||
    !validHash(hash)
  ) {
    return NextResponse.json(
      {
        error:
          "A valid wallet and transaction hash are required.",
      },
      { status: 400 },
    );
  }

  try {
    const verified =
      await verifyPolicyDeltaTransaction(
        {
          wallet,
          hash,
        },
      );

    if (
      !verified.methodVerified ||
      !verified
        .metadataVerified ||
      !verified.policyId
    ) {
      return NextResponse.json(
        {
          error:
            "Bradbury transaction metadata could not be independently verified.",
        },
        { status: 409 },
      );
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
      verified.finalizedSuccess
    ) {
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
    }

    return NextResponse.json(
      await readWalletAccount(
        wallet,
      ),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Bradbury verification failed.";

    return NextResponse.json(
      { error: message },
      { status: 409 },
    );
  }
}

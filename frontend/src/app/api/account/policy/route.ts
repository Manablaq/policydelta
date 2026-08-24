import {
  normalizeWallet,
} from "@/lib/account/validation";
import {
  policyRoleForWallet,
} from "@/lib/account/server-verification";
import {
  accountDatabaseConfigured,
  readWalletAccount,
  upsertWalletPolicy,
} from "@/lib/server/db";
import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
) {
  if (!accountDatabaseConfigured()) {
    return NextResponse.json({
      configured: false,
    });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const data =
    body &&
    typeof body === "object" &&
    !Array.isArray(body)
      ? body as Record<
          string,
          unknown
        >
      : {};

  const wallet =
    normalizeWallet(
      typeof data.wallet === "string"
        ? data.wallet
        : "",
    );

  const policyId =
    typeof data.policyId === "string"
      ? data.policyId.trim()
      : "";

  if (!wallet || !policyId) {
    return NextResponse.json(
      {
        error:
          "wallet and policyId are required.",
      },
      { status: 400 },
    );
  }

  if (policyId.length > 256) {
    return NextResponse.json(
      {
        error:
          "Policy ID is too long.",
      },
      { status: 400 },
    );
  }

  try {
    const role =
      await policyRoleForWallet(
        wallet,
        policyId,
      );

    if (!role) {
      return NextResponse.json(
        {
          error:
            "This wallet is not the on-chain principal or publisher of that policy.",
        },
        { status: 403 },
      );
    }

    await upsertWalletPolicy(
      wallet,
      policyId,
      role,
    );

    return NextResponse.json(
      await readWalletAccount(wallet),
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Bradbury could not verify this policy association.",
      },
      { status: 502 },
    );
  }
}

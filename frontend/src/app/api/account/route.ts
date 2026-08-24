import {
  normalizeWallet,
} from "@/lib/account/validation";
import {
  accountDatabaseConfigured,
  readWalletAccount,
} from "@/lib/server/db";
import {
  refreshWalletActivityFromBradbury,
} from "@/lib/account/server-refresh";
import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  const wallet =
    normalizeWallet(
      request.nextUrl.searchParams.get(
        "wallet",
      ) ?? "",
    );

  if (!wallet) {
    return NextResponse.json(
      {
        error:
          "A valid wallet address is required.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (!accountDatabaseConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        wallet,
        policies: [],
        activity: [],
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    await refreshWalletActivityFromBradbury(
      wallet,
    );

    const snapshot =
      await readWalletAccount(wallet);

    return NextResponse.json(
      snapshot,
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "PolicyDelta account index is temporarily unavailable.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

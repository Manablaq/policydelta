import {
  discoverWalletAccount,
} from "@/lib/account/chain-discovery";
import {
  normalizeWallet,
} from "@/lib/account/validation";
import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  const wallet =
    normalizeWallet(
      request.nextUrl
        .searchParams
        .get("wallet") ??
        "",
    );

  if (!wallet) {
    return NextResponse.json(
      {
        error:
          "A valid wallet address is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const snapshot =
      await discoverWalletAccount(
        wallet,
      );

    return NextResponse.json(
      snapshot,
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Bradbury account discovery failed.",
      },
      {
        status: 502,
      },
    );
  }
}

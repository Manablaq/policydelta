import { neon } from "@neondatabase/serverless";
import type {
  IndexedWalletActivity,
  IndexedWalletPolicy,
  WalletAccountSnapshot,
  WalletPolicyRole,
} from "@/lib/account/types";

let schemaPromise:
  | Promise<void>
  | null = null;

function databaseUrl() {
  return process.env.DATABASE_URL?.trim() ?? "";
}

export function accountDatabaseConfigured() {
  return Boolean(databaseUrl());
}

function sqlClient() {
  const url = databaseUrl();

  if (!url) {
    throw new Error(
      "PolicyDelta account database is not configured.",
    );
  }

  return neon(url);
}

export async function ensureAccountSchema() {
  if (!accountDatabaseConfigured()) {
    return;
  }

  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = sqlClient();

      await sql`
        CREATE TABLE IF NOT EXISTS policydelta_wallet_policies (
          wallet TEXT NOT NULL,
          policy_id TEXT NOT NULL,
          role TEXT NOT NULL,
          first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (wallet, policy_id),
          CONSTRAINT policydelta_wallet_policy_role
            CHECK (
              role IN ('principal', 'publisher', 'both')
            )
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS
          policydelta_wallet_policies_wallet_idx
        ON policydelta_wallet_policies (wallet)
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS policydelta_wallet_activity (
          hash TEXT PRIMARY KEY,
          wallet TEXT NOT NULL,
          function_name TEXT NOT NULL,
          policy_id TEXT,
          version INTEGER,
          consensus_status TEXT NOT NULL,
          execution_status TEXT NOT NULL,
          method_verified BOOLEAN NOT NULL DEFAULT FALSE,
          submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS
          policydelta_wallet_activity_wallet_idx
        ON policydelta_wallet_activity
          (wallet, updated_at DESC)
      `;
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  await schemaPromise;
}

export async function upsertWalletPolicy(
  wallet: string,
  policyId: string,
  role: WalletPolicyRole,
) {
  await ensureAccountSchema();

  const sql = sqlClient();

  await sql`
    INSERT INTO policydelta_wallet_policies (
      wallet,
      policy_id,
      role
    )
    VALUES (
      ${wallet},
      ${policyId},
      ${role}
    )
    ON CONFLICT (wallet, policy_id)
    DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = NOW()
  `;
}

export async function upsertWalletActivity(
  input: {
    hash: string;
    wallet: string;
    functionName: string;
    policyId: string | null;
    version: number | null;
    consensusStatus: string;
    executionStatus: string;
    methodVerified: boolean;
  },
) {
  await ensureAccountSchema();

  const sql = sqlClient();

  await sql`
    INSERT INTO policydelta_wallet_activity (
      hash,
      wallet,
      function_name,
      policy_id,
      version,
      consensus_status,
      execution_status,
      method_verified
    )
    VALUES (
      ${input.hash},
      ${input.wallet},
      ${input.functionName},
      ${input.policyId},
      ${input.version},
      ${input.consensusStatus},
      ${input.executionStatus},
      ${input.methodVerified}
    )
    ON CONFLICT (hash)
    DO UPDATE SET
      wallet = EXCLUDED.wallet,
      function_name = EXCLUDED.function_name,
      policy_id = EXCLUDED.policy_id,
      version = EXCLUDED.version,
      consensus_status = EXCLUDED.consensus_status,
      execution_status = EXCLUDED.execution_status,
      method_verified = EXCLUDED.method_verified,
      updated_at = NOW()
  `;
}

export async function readWalletActivityNeedingRefresh(
  wallet: string,
) {
  if (!accountDatabaseConfigured()) {
    return [];
  }

  await ensureAccountSchema();

  const sql = sqlClient();

  const rows = await sql`
    SELECT hash
    FROM policydelta_wallet_activity
    WHERE wallet = ${wallet}
      AND consensus_status NOT IN (
        'FINALIZED',
        'CANCELED'
      )
      AND updated_at <
        NOW() - INTERVAL '10 seconds'
    ORDER BY updated_at ASC
    LIMIT 20
  `;

  return rows.map((row) => ({
    hash: String(row.hash),
  }));
}

export async function readWalletAccount(
  wallet: string,
): Promise<WalletAccountSnapshot> {
  if (!accountDatabaseConfigured()) {
    return {
      configured: false,
      wallet,
      policies: [],
      activity: [],
    };
  }

  await ensureAccountSchema();

  const sql = sqlClient();

  const policyRows = await sql`
    SELECT
      wallet,
      policy_id,
      role,
      first_seen_at,
      updated_at
    FROM policydelta_wallet_policies
    WHERE wallet = ${wallet}
    ORDER BY updated_at DESC
    LIMIT 100
  `;

  const activityRows = await sql`
    SELECT
      hash,
      wallet,
      function_name,
      policy_id,
      version,
      consensus_status,
      execution_status,
      method_verified,
      submitted_at,
      updated_at
    FROM policydelta_wallet_activity
    WHERE wallet = ${wallet}
    ORDER BY updated_at DESC
    LIMIT 100
  `;

  const policies:
    IndexedWalletPolicy[] =
    policyRows.map((row) => ({
      wallet: String(row.wallet),
      policyId: String(row.policy_id),
      role:
        String(row.role) as WalletPolicyRole,
      firstSeenAt:
        new Date(
          String(row.first_seen_at),
        ).toISOString(),
      updatedAt:
        new Date(
          String(row.updated_at),
        ).toISOString(),
    }));

  const activity:
    IndexedWalletActivity[] =
    activityRows.map((row) => ({
      hash: String(row.hash),
      wallet: String(row.wallet),
      functionName:
        String(row.function_name),
      policyId:
        row.policy_id == null
          ? null
          : String(row.policy_id),
      version:
        row.version == null
          ? null
          : Number(row.version),
      consensusStatus:
        String(row.consensus_status),
      executionStatus:
        String(row.execution_status),
      methodVerified:
        row.method_verified === true,
      submittedAt:
        new Date(
          String(row.submitted_at),
        ).toISOString(),
      updatedAt:
        new Date(
          String(row.updated_at),
        ).toISOString(),
    }));

  return {
    configured: true,
    wallet,
    policies,
    activity,
  };
}

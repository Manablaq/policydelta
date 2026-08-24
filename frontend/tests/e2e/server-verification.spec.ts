import {
  expect,
  test,
} from "@playwright/test";
import {
  extractFunctionNameFromTransaction,
  extractPolicyDeltaCallFromTransaction,
  isFinalizedSuccessfulTransaction,
  verifyPolicyDeltaTransaction,
} from "@/lib/account/server-verification";

const PRINCIPAL =
  "0x1f87Ae197af539253978d435aD45cCf28Fb95024";

const POLICY_ID =
  "policydelta-bradbury-live-001";

const REAL_PROPOSE_TX =
  "0x1a8dd6b5162b363240ee28bc46b24c56881a6732eecfe392a8a1c9166d390b51";

test("extracts PolicyDelta methods from real Bradbury txData when txDataDecoded omits the method", () => {
  const fixtures = [
    {
      expected:
        "consent_to_version",
      txData:
        "0xf845b84216046172677315ec01706f6c69637964656c74612d62726164627572792d6c6976652d30303119066d6574686f649401636f6e73656e745f746f5f76657273696f6e00",
    },
    {
      expected:
        "propose_version",
      txData:
        "0xf8dbb8d816046172677315ec01706f6c69637964656c74612d62726164627572792d6c6976652d303031cc09466f7220656163682063616c656e646172206d6f6e74682c20746865206167656e7420697320617574686f72697a656420746f207370656e64206e6f206d6f7265207468616e203130302047454e206f6e2041575320696e6672617374727563747572652e2053656e64696e672066756e647320746f20706572736f6e616c2077616c6c657473206973206e6f74207065726d69747465642e066d6574686f647c70726f706f73655f76657273696f6e00",
    },
    {
      expected:
        "review_version",
      txData:
        "0xf840b83d16046172677315ec01706f6c69637964656c74612d62726164627572792d6c6976652d30303111066d6574686f64747265766965775f76657273696f6e00",
    },
  ] as const;

  for (const fixture of fixtures) {
    expect(
      extractFunctionNameFromTransaction(
        {
          txData:
            fixture.txData,
          txDataDecoded: {
            leaderOnly: false,
            type: "call",
          },
        },
      ),
    ).toBe(
      fixture.expected,
    );
  }
});

test("structured decoded method remains authoritative when available", () => {
  expect(
    extractFunctionNameFromTransaction(
      {
        txDataDecoded: {
          type: "call",
          functionName:
            "reject_version",
        },
        txData: "0x00",
      },
    ),
  ).toBe(
    "reject_version",
  );
});

test("unknown or malformed calldata does not become a verified PolicyDelta method", () => {
  expect(
    extractFunctionNameFromTransaction(
      {
        txDataDecoded: {
          type: "call",
        },
        txData:
          "0xdeadbeef",
      },
    ),
  ).toBeNull();

  expect(
    extractFunctionNameFromTransaction(
      {
        txDataDecoded: {
          type: "call",
        },
        txData:
          "not-hex",
      },
    ),
  ).toBeNull();
});

test("policy metadata comes from SDK-decoded transaction arguments rather than client claims", () => {
  const call =
    extractPolicyDeltaCallFromTransaction(
      {
        txDataDecoded: {
          type: "call",
          callData:
            new Map<
              string,
              unknown
            >([
              [
                "args",
                [
                  POLICY_ID,
                  BigInt(6),
                ],
              ],
              [
                "method",
                "review_version",
              ],
            ]),
        },
      },
    );

  expect(call).toEqual({
    functionName:
      "review_version",
    policyId:
      POLICY_ID,
    version: 6,
    metadataVerified: true,
  });
});

test("ACCEPTED execution is not classified as finalized success", () => {
  expect(
    isFinalizedSuccessfulTransaction(
      "ACCEPTED",
      "FINISHED_WITH_RETURN",
    ),
  ).toBe(false);

  expect(
    isFinalizedSuccessfulTransaction(
      "FINALIZED",
      "FINISHED_WITH_RETURN",
    ),
  ).toBe(true);

  expect(
    isFinalizedSuccessfulTransaction(
      "FINALIZED",
      "FINISHED_WITH_ERROR",
    ),
  ).toBe(false);
});

test("real Bradbury transaction independently yields its PolicyDelta method and policy ID", async () => {
  const verified =
    await verifyPolicyDeltaTransaction(
      {
        wallet:
          PRINCIPAL,
        hash:
          REAL_PROPOSE_TX,
      },
    );

  expect(
    verified.methodVerified,
  ).toBe(true);

  expect(
    verified.metadataVerified,
  ).toBe(true);

  expect(
    verified.functionName,
  ).toBe(
    "propose_version",
  );

  expect(
    verified.policyId,
  ).toBe(
    POLICY_ID,
  );

  // propose_version does not carry
  // its newly allocated version number
  // as an input argument.
  expect(
    verified.version,
  ).toBeNull();

  expect(
    verified.consensusStatus,
  ).not.toBe(
    "UNINITIALIZED",
  );
});

export type PolicyDeltaTransactionPhase =
  | "submitted"
  | "processing"
  | "accepted"
  | "ready_to_finalize"
  | "finalized"
  | "execution_error"
  | "leader_timeout"
  | "validator_timeout";

export const transactionPhaseCopy: Record<
  PolicyDeltaTransactionPhase,
  {
    label: string;
    description: string;
    final: boolean;
  }
> = {
  submitted: {
    label: "Submitted",
    description: "The transaction has been submitted to GenLayer.",
    final: false,
  },
  processing: {
    label: "Processing",
    description: "Validators are processing the transaction.",
    final: false,
  },
  accepted: {
    label: "Accepted",
    description:
      "Consensus accepted the transaction. This is not the same as finality.",
    final: false,
  },
  ready_to_finalize: {
    label: "Ready to finalize",
    description: "The finality window has completed.",
    final: false,
  },
  finalized: {
    label: "Finalized",
    description: "The transaction has reached GenLayer finality.",
    final: true,
  },
  execution_error: {
    label: "Execution error",
    description:
      "Consensus completed, but the contract execution did not succeed.",
    final: true,
  },
  leader_timeout: {
    label: "Leader timeout",
    description:
      "The current leader timed out. The transaction may still recover.",
    final: false,
  },
  validator_timeout: {
    label: "Validator timeout",
    description:
      "Validator processing timed out. The transaction may still recover.",
    final: false,
  },
};

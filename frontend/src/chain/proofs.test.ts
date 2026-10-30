import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./client", () => ({
  publicClient: {
    getBlockNumber: vi.fn(),
    getContractEvents: vi.fn(),
  },
}));

const log = (block: bigint, suffix: string) => ({
  args: {
    taskId: `0xtask-${suffix}`,
    agentId: 1n,
    root: `0xroot-${suffix}`,
    bodyHash: `0xbody-${suffix}`,
    costMicros: 10n,
  },
  blockNumber: block,
  transactionHash: `0xtx-${suffix}`,
});

describe("listCommitments", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("reads a single page straight through and returns it newest first", async () => {
    const { publicClient } = await import("./client");
    vi.mocked(publicClient.getBlockNumber).mockResolvedValue(1999n);
    vi.mocked(publicClient.getContractEvents).mockResolvedValueOnce([log(5n, "a"), log(10n, "b")] as unknown as Awaited<
      ReturnType<typeof publicClient.getContractEvents>
    >);

    const { listCommitments } = await import("./proofs");
    const rows = await listCommitments();

    expect(rows.map((r) => r.taskId)).toEqual(["0xtask-b", "0xtask-a"]);
  });

  it("splits a page that fails (413, response too large) and keeps what the halves return", async () => {
    const { publicClient } = await import("./client");
    vi.mocked(publicClient.getBlockNumber).mockResolvedValue(1999n);
    const byRange: Record<string, () => unknown> = {
      // The whole page and its left half are both "too large"; every other range succeeds.
      "0-1999": () => Promise.reject(new Error("413")),
      "0-999": () => Promise.reject(new Error("413")),
      "0-499": () => Promise.resolve([log(100n, "a")]),
      "500-999": () => Promise.resolve([log(600n, "b")]),
      "1000-1999": () => Promise.resolve([log(1500n, "c")]),
    };
    vi.mocked(publicClient.getContractEvents).mockImplementation((args) => {
      const { fromBlock, toBlock } = args as { fromBlock: bigint; toBlock: bigint };
      const key = `${String(fromBlock)}-${String(toBlock)}`;
      const respond = byRange[key];
      if (!respond) throw new Error(`unexpected range ${key}`);
      return respond() as ReturnType<typeof publicClient.getContractEvents>;
    });

    const { listCommitments } = await import("./proofs");
    const rows = await listCommitments();

    expect(rows.map((r) => r.taskId)).toEqual(["0xtask-c", "0xtask-b", "0xtask-a"]);
  });

  it("gives up on a slice that still fails once it can no longer be split, instead of losing every page", async () => {
    const { publicClient } = await import("./client");
    vi.mocked(publicClient.getBlockNumber).mockResolvedValue(19n);
    vi.mocked(publicClient.getContractEvents).mockRejectedValue(new Error("413"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { listCommitments } = await import("./proofs");
    const rows = await listCommitments();

    expect(rows).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });
});

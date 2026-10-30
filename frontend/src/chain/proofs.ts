import type { Hash, Hex } from "viem";
import { escrowAbi, receiptRegistryAbi } from "./abi";
import { LIVE } from "../config/live";
import { publicClient } from "./client";
import { blockRanges } from "./ranges";

/** Largest block range per getLogs call; public Base RPCs refuse larger ones. */
const PAGE = 2000n;

/** Below this width, a page that still fails is given up on rather than split further. */
const MIN_PAGE = 50n;

export type Commitment = {
  taskId: Hex;
  agentId: bigint;
  root: Hex;
  bodyHash: Hex;
  costMicros: bigint;
  blockNumber: bigint;
  tx: Hash;
};

/**
 * One page's commitments. The public RPC caps `eth_getLogs` by response size, not just block count, so
 * even a PAGE-sized range can still be refused (413) when it happens to be log-dense. On failure, split
 * the range in half and retry each half; a page that still fails once it can no longer be split is
 * skipped and logged, so one bad slice doesn't take down every receipt in every other page.
 */
async function fetchPage(fromBlock: bigint, toBlock: bigint): Promise<Commitment[]> {
  try {
    const logs = await publicClient.getContractEvents({
      address: LIVE.contracts.registry,
      abi: receiptRegistryAbi,
      eventName: "ReceiptCommitted",
      fromBlock,
      toBlock,
    });
    return logs.map((l) => ({
      taskId: l.args.taskId as Hex,
      agentId: l.args.agentId as bigint,
      root: l.args.root as Hex,
      bodyHash: l.args.bodyHash as Hex,
      costMicros: l.args.costMicros as bigint,
      blockNumber: l.blockNumber,
      tx: l.transactionHash,
    }));
  } catch (err) {
    if (toBlock - fromBlock < MIN_PAGE) {
      console.warn(`listCommitments: giving up on blocks ${fromBlock}-${toBlock}`, err);
      return [];
    }
    const mid = fromBlock + (toBlock - fromBlock) / 2n;
    const [left, right] = await Promise.all([fetchPage(fromBlock, mid), fetchPage(mid + 1n, toBlock)]);
    return [...left, ...right];
  }
}

/** Every receipt committed on chain, newest first, read in pages. */
export async function listCommitments(): Promise<Commitment[]> {
  const latest = await publicClient.getBlockNumber();
  const out: Commitment[] = [];
  for (const [fromBlock, toBlock] of blockRanges(LIVE.deployBlock, latest, PAGE)) {
    out.push(...(await fetchPage(fromBlock, toBlock)));
  }
  return out.reverse();
}

export type OnChain = {
  agentId: bigint;
  root: Hex;
  terminalHash: Hex;
  bodyHash: Hex;
  costMicros: bigint;
  phiHash: Hex;
};

/** What the chain says about a task's receipt, or null if nothing is committed. */
export async function readCommitment(taskId: Hex): Promise<OnChain | null> {
  const [c, phiHash] = await Promise.all([
    publicClient.readContract({
      address: LIVE.contracts.registry,
      abi: receiptRegistryAbi,
      functionName: "commitmentOf",
      args: [taskId],
    }),
    publicClient.readContract({
      address: LIVE.contracts.escrow,
      abi: escrowAbi,
      functionName: "phiHashOf",
      args: [taskId],
    }),
  ]);
  if (c.committedAt === 0n) return null;
  return {
    agentId: c.agentId,
    root: c.root,
    terminalHash: c.terminalHash,
    bodyHash: c.bodyHash,
    costMicros: c.costMicros,
    phiHash,
  };
}

/** The bundle with this body hash, as JSON text. By hash, so nobody can serve another bundle in its place. */
export async function fetchBundle(bodyHash: Hex): Promise<string | null> {
  const res = await fetch(`${LIVE.storeUrl}/v0/bundles/${bodyHash}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("The receipt store did not answer. Try again in a moment.");
  return res.text();
}

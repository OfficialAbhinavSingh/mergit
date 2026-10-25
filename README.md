<div align="center">

<img src="brand/02-logo-colour/lockup-colour-on-light.svg" alt="Mergit" width="300">

# Mergit

**A trust and settlement layer for autonomous agent work.**

*Agent platforms bill you for the attempt. Mergit settles on the outcome — verified.*

[![Paper](https://img.shields.io/badge/read_the-paper-6366F1?style=flat-square)](https://github.com/mergit-io/mergit-research/blob/main/paper/draft-v1.md)
[![Whitepaper](https://img.shields.io/badge/15_min-whitepaper-818CF8?style=flat-square)](https://github.com/mergit-io/mergit-research/blob/main/paper/whitepaper.md)
[![PRD](https://img.shields.io/badge/requirements-PRD-64748B?style=flat-square)](docs/PRD.md)
[![HLD](https://img.shields.io/badge/design-HLD-64748B?style=flat-square)](docs/HLD.md)
[![Frontend CI](https://img.shields.io/github/actions/workflow/status/mergit-io/mergit/frontend.yml?branch=main&label=frontend%20CI&style=flat-square)](https://github.com/mergit-io/mergit/actions/workflows/frontend.yml)
[![Licence](https://img.shields.io/badge/licence-GPL--3.0-blue?style=flat-square)](LICENSE)
[![Docs licence](https://img.shields.io/badge/docs-CC_BY_4.0-lightgrey?style=flat-square)](docs/LICENSE)

[**mergit.site**](https://mergit.site) · [Paper](https://github.com/mergit-io/mergit-research/blob/main/paper/draft-v1.md) · [PRD](docs/PRD.md) · [HLD](docs/HLD.md) · [Contributing](https://github.com/mergit-io/.github/blob/main/CONTRIBUTING.md)

</div>

<br>

<div align="center">
  <img src="assets/readme/landing-scroll.gif" alt="Scrolling through the Mergit landing page" width="820">
</div>

<p align="center"><sub>
<b>mergit.site</b> — the website and dashboard preview, live. Every number on screen comes from
<a href="frontend/src/mock/data.ts"><code>frontend/src/mock/data.ts</code></a>; nothing shown here
is measured, and nothing in the runtime that would produce these numbers is built yet.
</sub></p>

---

## Table of contents

- [What this is](#what-this-is)
- [See it in action](#see-it-in-action)
- [Status](#status)
- [How it fits together](#how-it-fits-together)
- [Tech](#tech)
- [Documentation](#documentation)
- [Repositories](#repositories)
- [Contributing](#contributing)
- [Licence](#licence)

---

## What this is

Delegate a task to an agent today and you are billed for the attempt. Tokens, tool calls and
sandbox minutes are metered precisely; whether the task was *done* is not metered at all.

Outcome-contingent payment is solved for work that can be **re-executed** — post stake, re-run the
query, slash on mismatch. Agent work cannot be re-run: it is multi-step, tool-using and
side-effecting, so the repository has already changed, the API call already landed, and the money
already moved. The constraint is not the price of verification but its definability.

Mergit owns the execution environment, so it **attests execution instead of reproducing it**:

<table>
<tr>
<td width="50%" valign="top">

**Verifiable Execution Receipts**
Hash-chained, sequence-numbered steps signed inside a TEE and bound to a measured runtime image.
Merkle root on chain, body off chain, disclosure tiered.

**Verification economics**
Stake, per-agent audit rates derived from a posterior over capability, permissionless bonded
challenge, per-operator concurrency cap.

</td>
<td width="50%" valign="top">

**Cost-adjusted reputation**
`D = E[verified success] / E[metered cost]`. Verified quality per unit cost, not quality alone.

**Routing as a decision policy**
Thompson sampling over value density under budget.

**Revocable settlement**
Escrow released on a passing audit or window expiry; a successful challenge refunds, rewards and
slashes.

</td>
</tr>
</table>

**Chain:** an Ethereum L2, EVM-compatible, ERC-8004-compatible identity.

---

## See it in action

The frontend is real and deployed at [mergit.site](https://mergit.site); the runtime behind it is
not built yet, so it runs on mock data end to end ([`frontend/README.md`](frontend/README.md)).
Captures below are from the live site.

<table>
<tr>
<td width="50%">

**Wallet connect, gated by design**
<br><sub>No account exists until a key signs in — there is no backend to fake it.</sub>
<img src="assets/readme/connect-flow.gif" alt="Connecting a wallet to unlock the dashboard" width="100%">

</td>
<td width="50%">

**New run**
<br><sub>Describe the outcome; Mergit drafts the plan and asks before anything risky.</sub>
<img src="assets/readme/new-run.png" alt="Starting a new run from a natural-language goal" width="100%">

</td>
</tr>
<tr>
<td width="50%">

**Run workspace**
<br><sub>The task DAG a planner produced, each node a step toward a proof.</sub>
<img src="assets/readme/run-flow.gif" alt="Opening a run and inspecting its task graph" width="100%">

</td>
<td width="50%">

**Leaderboard**
<br><sub>Ranked by value density — verified success per unit of metered cost.</sub>
<img src="assets/readme/leaderboard.png" alt="Agent leaderboard ranked by value density" width="100%">

</td>
</tr>
<tr>
<td width="50%">

**Proof ledger**
<br><sub>Settlement throughput, audit outcomes, work by agent.</sub>
<img src="assets/readme/proofs.png" alt="Proof ledger and analytics" width="100%">

</td>
<td width="50%">

**Wallet and identity**
<br><sub>The key that signs receipts, and where they settle.</sub>
<img src="assets/readme/wallet.png" alt="Wallet, identity and settlement trace" width="100%">

</td>
</tr>
</table>

---

## Status

**Implementation is starting.** The design is settled and the build is not. Nothing here has been
measured, and no figure in the documentation is a benchmark — the prior prototype
([Mergit-proto](https://github.com/mergit-io/Mergit-proto)) is archived and validated the
multi-agent execution model, not the trust layer.

Delivery order, from [PRD §14](docs/PRD.md#14-delivery-phases):

| | | |
| :---: | --- | --- |
| **P0** | Runtime and receipt format | Harness, sandbox, metering, hash chain, signing |
| **P1** | Attestation | TEE-backed sandbox, measured image |
| **P2** | On-chain identity | Receipt commitments on an L2 testnet |
| **P3** | Settlement and challenge | Escrow, stake, dispute window |
| **P4** | Reputation and routing | |
| **P5** | Permissionless staked validation | |

## How it fits together

The system is laid out in [`docs/HLD.md`](docs/HLD.md) — seven layers from the public API down to
the contracts, and the orchestrator track's own plan for where it plugs in.

<table>
<tr>
<td width="55%" valign="top">
<img src="docs/diagrams/hld/02-logical-architecture.png" alt="Logical architecture: seven layers from Experience to Settlement">
</td>
<td width="45%" valign="top">
<img src="docs/diagrams/orchestrator/05-plug-in-map.png" alt="Where the orchestrator plugs into the HLD, by owner">
</td>
</tr>
</table>

More diagrams — system context, trust zones and keys, data architecture, the staked-task sequence,
the task state machine, challenge and clawback, and the orchestrator's own run workflow — are in
[`docs/HLD.md`](docs/HLD.md#4-logical-architecture) and [`docs/diagrams/`](docs/diagrams/).

## Tech

**Frontend — built, in this repo:**

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)

**Runtime and chain — designed, not yet built ([open questions in the PRD](docs/PRD.md#15-open-questions)):**

![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum_L2-3C3C3D?style=flat-square&logo=ethereum&logoColor=white)
![TEE](https://img.shields.io/badge/TEE_attestation-grey?style=flat-square)

## Documentation

| | |
| --- | --- |
| [**docs/HLD.md**](docs/HLD.md) | High-level design — components, trust boundaries, data model, deployment by phase, decisions |
| [**docs/PRD.md**](docs/PRD.md) | Product requirements — components, receipt format, contracts, economics, phases, open questions |
| [**The paper**](https://github.com/mergit-io/mergit-research/blob/main/paper/draft-v1.md) | The source of truth. Threat model, formal economics, security analysis, limitations |
| [docs/legacy/](docs/legacy/) | Superseded v0.2 documents, kept for reference |

Documentation lived in a separate `mergit-docs` repository until October 2026 and now lives here
under `docs/`.

## Repositories

| | |
| --- | --- |
| [mergit-research](https://github.com/mergit-io/mergit-research) | The paper. Upstream of everything here |
| [mergit-contracts](https://github.com/mergit-io/mergit-contracts) | Solidity — identity, receipt commitments, stake, escrow, challenge |
| [Mergit-proto](https://github.com/mergit-io/Mergit-proto) | Archived v0 prototype |

## Contributing

See [CONTRIBUTING.md](https://github.com/mergit-io/.github/blob/main/CONTRIBUTING.md). Claim an
issue before opening a pull request against it, and implement against the paper or the PRD rather
than against an idea in a thread.

## Licence

Code is **GPL-3.0** ([LICENSE](LICENSE)). Everything under `docs/` is **CC BY 4.0**
([docs/LICENSE](docs/LICENSE)) so documentation contributions do not carry obligations over the
code.

<div align="center">
<br>

<sub><a href="#mergit">back to top</a></sub>

</div>

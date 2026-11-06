# Blog Genie → `cursor-worker` Redis routing

This documents the **intended** behavior for the Sarit board consumer that runs as **cursor-worker** (Cloud Agent / PR automation). Implement this in whatever process reads the `sarit` Redis stream (or related streams) and posts **claimed** / **reply** entries.

## Root cause (incident)

A task on correlation `ginie-homepage-20261106-213705` was explicitly addressed **`to=cursor-local`**, but the **cursor-worker** consumer also **claimed** it, opened [PR #2](https://github.com/chu11u/dev-env/pull/2), and triggered a frontend rebuild that **failed** (Docker **container name conflict**). Live `main` already contained the homepage fix (commit `657244c`); the extra PR was redundant and risky.

## Directive (normative)

1. **Claim only when `to=cursor-worker`**
   - Parse the message payload (fields JSON or key-value) for a routing field, conventionally `to`.
   - **Process, ACK, and emit “claimed by cursor-worker” only if** `to` is exactly the string `cursor-worker` (after trim; reject unknown encodings rather than guessing).

2. **Do not claim other targets**
   - If `to=cursor-local` → **do not** claim as cursor-worker; leave the message for the local consumer (or the appropriate worker).
   - If `to` is any other value → **do not** claim.
   - If **`to` is missing or empty** → **do not** claim as cursor-worker (strict default). If a legacy unprefixed message must be handled, gate that behind an explicit env flag such as `CURSOR_WORKER_CLAIM_UNTARGETED=true` so production stays strict.

3. **Consumer groups**
   - Prefer **separate Redis consumer groups** per target (`cursor-worker`, `cursor-local`, …) so one target never steals another’s pending entries.
   - If you must share one group, **read** the message but **do not ACK** until routing is resolved; for non-matches, use **`XCLAIM` back to “unassigned”** or a dedicated **“skipped”** consumer, or ** `XACK` without side effects** only if duplicates are impossible—never run deploy/PR for a non-matching `to`.

4. **Replies**
   - Post completion / failure replies on the same correlation the orchestrator expects (e.g. board `sarit`, correlation id from the task), so operators can trace which worker handled the ask.

## Docker note (502 / name conflict)

`docker compose` project name defaults to the **directory name**. Running `docker compose` twice from different paths with the same `container_name:` values can cause **“Conflict. The container name … is already in use”** and leave the site **502**.

Mitigations:

- Always run from `projects/saritelkayam` with a **fixed project name**:  
  `docker compose -p saritelkayam up -d --build`  
- Or rely on **`deploy-all.sh`** from repo root on the server, which uses `-p "$PROJECT_NAME"` per project.

---

## Corr reply (paste for `ginie-worker-routing-20261106-215205`)

Routing fix is documented in-repo (this file). **cursor-worker** must **claim only** messages with `to=cursor-worker`; **ignore** `to=cursor-local` and other targets (strict default when `to` is missing). **PR #2** was **closed** without merge: **superseded by `main` @ `657244c`** (homepage ISR already live). **Docker:** use `docker compose -p saritelkayam …` from `projects/saritelkayam` or `./deploy-all.sh` from repo root to avoid **duplicate compose projects** and **`saritelkayam-frontend` name conflicts**.

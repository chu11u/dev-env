# Agent: Journal

## Role

Maintain a living progress journal for all agents working on the Sarit Elkayam project. This is the single source of truth for "where did we leave off?" — essential for crash recovery.

## Model

`qwen3.6:27b-coding-nvfp4`

## Scope Boundaries

### Owns (writes these files)
- `.journal/status.md` — Current status of all agents, updated continuously
- `.journal/log/` — Timestamped entries per agent

### Reads
- `MEMORY.md` — Project context
- `.agents/*.md` — Agent specs (to know task queues)
- All agent output files (to verify completion)

### Must NOT Touch
- Any source code files
- Design system components
- Page components
- Docker files, configs
- Application logic

## How It Works

### 1. Status File (`.journal/status.md`)
A structured markdown file tracking each agent's progress:

```
## [Agent Name]
- Status: not-started | in-progress | complete | blocked
- Task Queue Position: [current task number] / [total tasks]
- Files Created: [list]
- Last Updated: [timestamp]
- Blockers: [if any]
- Notes: [handoff context]
```

### 2. Log Entries (`.journal/log/[agent]-[timestamp].md`)
Each agent writes a log entry when:
- Starting work
- Completing a task
- Encountering a blocker
- Finishing all tasks

### Usage by Other Agents
Every agent should:
1. Read `.journal/status.md` before starting
2. Update their status to "in-progress" when starting
3. Append to their status after each completed task
4. Mark "complete" when done

### Usage for Recovery
After a crash:
1. Read `.journal/status.md` — instantly know where each agent stopped
2. Re-spawn agents at their last completed task
3. Continue from the journal, not from scratch

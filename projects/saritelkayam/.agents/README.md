# Agent System — Sarit Elkayam Website

## How to Activate an Agent

1. Read this README for overview
2. Read the agent's spec file (e.g., `.agents/frontend.md`)
3. Read the agent's skill files (listed in its spec)
4. Read `MEMORY.md` for project context
5. Execute the agent's task queue

## All Agents Use the Same Model

**`qwen3.6:27b-coding-nvfp4`** — already pulled via Ollama.

Agent differentiation comes from scope boundaries and loaded skills, not different models.

## Agent Roster

| Agent | Spec File | Skills | Phase |
|---|---|---|---|
| Infrastructure | `.agents/infrastructure.md` | `docker-deploy` | 1, 3 |
| Design System | `.agents/design-system.md` | `tailwind-css`, `framer-motion` | 1 |
| Media | `.agents/media.md` | `draw-things-api` | 1 |
| Frontend | `.agents/frontend.md` | `nextjs-app-router`, `tailwind-css`, `framer-motion` | 2, 3 |
| Fullstack | `.agents/fullstack.md` | `nextjs-app-router`, `prisma-orm` | 2 |

## Execution Order

### Phase 1 — Foundation (all 3 agents run in parallel)
- **Infrastructure**: Docker files, nginx config, docker-compose
- **Design System**: Tailwind config, global CSS, UI components, layout components
- **Media**: Generate all image assets via Draw Things API

### Phase 2 — Core Features (both agents run in parallel, after Phase 1)
- **Frontend**: All page components, sections, routing
- **Fullstack**: Prisma schema, API routes, blog CMS admin UI

### Phase 3 — Polish (sequential)
- **Frontend**: Framer Motion animations, mobile responsive polish
- **Infrastructure**: Final deployment, Cloudflare tunnel config

## Task Dependencies

```
Phase 1:  Infrastructure ──┐
         Design System ────┼──→ Phase 2: Frontend, Fullstack (parallel)
         Media ────────────┘
                              ↓
                         Phase 3: Polish (sequential)
```

## Output Conventions

- Each agent writes to its designated output directories
- No agent modifies files owned by another agent (except reading)
- All agents respect the project structure defined in `MEMORY.md`
- Agents update the FEATURES STATUS table in `MEMORY.md` as they complete tasks

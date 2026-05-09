# STAGEONE — AI Digital Agency

Premium black-and-gold AI digital agency website with a live NVIDIA-powered AI assistant, content generation, and business strategy advisor built in.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/stageone run dev` — run the frontend (port 22923)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `NVIDIA_API_KEY` — NVIDIA AI API key (get at build.nvidia.com)
- Required env: `SESSION_SECRET` — session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend**: React + Vite + Wouter + TailwindCSS + Framer Motion
- **API**: Express 5 + pino logging
- **AI**: NVIDIA AI APIs (OpenAI-compatible via `openai` SDK) — `integrate.api.nvidia.com/v1`
- **DB**: PostgreSQL + Drizzle ORM (available, not yet used for AI)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Where things live

- `artifacts/stageone/` — Frontend (React/Vite) — all 4 pages + AI chat widget
- `artifacts/api-server/` — Express API server
- `artifacts/api-server/src/lib/ai/` — AI service layer
  - `nvidia.ts` — NVIDIA client singleton + model registry
  - `chatService.ts` — Chat completion (streaming + non-streaming)
  - `contentService.ts` — Content generation (6 content types)
  - `businessService.ts` — Business strategy advisor (JSON-structured output)
  - `index.ts` — Barrel export
- `artifacts/api-server/src/routes/ai/` — AI API routes
  - `chat.ts` — `POST /api/ai/chat` + `POST /api/ai/chat/stream` (SSE)
  - `content.ts` — `POST /api/ai/content`
  - `business.ts` — `POST /api/ai/business`
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-zod/src/` — Generated Zod schemas
- `lib/api-client-react/src/` — Generated React Query hooks
- `artifacts/stageone/src/components/sections/AiChatWidget.tsx` — Live AI chat widget
- `artifacts/stageone/public/favicon.png` — STAGEONE favicon
- `artifacts/stageone/public/logo.png` — STAGEONE logo

## AI Architecture

### Models
| Use Case | Model |
|---|---|
| Chat / Chatbot | `meta/llama-3.1-70b-instruct` |
| Content Generation | `mistralai/mistral-large-2-instruct` |
| Business Strategy | `nvidia/llama-3.1-nemotron-70b-instruct` |

### Endpoints
- `POST /api/ai/chat` — Non-streaming chat completion
- `POST /api/ai/chat/stream` — SSE streaming chat (used by chat widget)
- `POST /api/ai/content` — Content generation (blog, social, email, landing page, ads, case study)
- `POST /api/ai/business` — Business strategy & automation advice

### Chat Widget
The floating chat widget (`AiChatWidget.tsx`) connects to `/api/ai/chat/stream` using SSE for real-time token streaming. It maintains conversation history and has the STAGEONE system prompt baked in. The widget appears on all pages via `App.tsx`.

## Architecture decisions

- NVIDIA AI APIs are OpenAI-compatible — using the `openai` npm SDK with a custom `baseURL`
- Streaming is via SSE (Server-Sent Events), not WebSockets — simpler, works through HTTP proxies
- Business assistant returns structured JSON for `answer`, `recommendations`, and `nextSteps`
- The `lib/api-zod/src/index.ts` barrel must only export from `./generated/api` — orval's `mode: "split"` without `schemas` option generates only this file. The codegen script auto-fixes this after each orval run.
- Frontend uses wouter for routing, not React Router

## Product

STAGEONE is a premium AI digital agency website with 8 pages and a full AI demo suite:

### Pages
- `/` — Home
- `/services` — Services
- `/about` — About
- `/contact` — Contact
- `/ai-generator` — AI Website Generator (NVIDIA-powered landing page concept generator)
- `/business-advisor` — AI Business Advisor (streaming strategy chat with history)
- `/chatbot-builder` — AI Chatbot Builder (build + live preview chatbots)
- `/ai-playground` — AI Playground (5 tabbed tools: Website Copy, Brand Names, Marketing AI, Automation Ideas, Chatbot Assistant — with usage limits and lead capture)
- `/admin` — Admin CRM Dashboard (PIN-protected, lead management)
- `/dashboard` — Internal SaaS Dashboard (Overview, Leads, AI Usage, Projects, Automations, Messages — sidebar nav, real charts, live data)

### Lead Capture & CRM
- All AI tools capture user emails before advanced generation
- Leads stored in PostgreSQL via `leadsTable`
- AI session usage tracked via `aiSessionsTable`
- Admin dashboard at `/admin` (PIN: `stageone2025` or set `ADMIN_PIN` env var)
- Lead status tracking: new → contacted → qualified → proposal_sent → closed_won/lost
- Full CRUD on leads from admin dashboard

## User preferences

- Black and gold luxury aesthetic throughout
- No emojis in UI
- Transparent navbar that blurs on scroll
- Logo = favicon icon (golden pyramid) + STAGEONE wordmark with mix-blend-mode: screen trick

## Gotchas

- `lib/api-zod/src/index.ts` gets regenerated by orval and may add stale references — the codegen script now auto-fixes it with `echo "export * from './generated/api';" > ../api-zod/src/index.ts`
- NVIDIA API calls can take 10-20 seconds on first request (cold start)
- The `openai` package is in `artifacts/api-server/dependencies` (not devDependencies) since it's a server runtime dep
- Never use `console.log` in server code — use `req.log` (request context) or `logger` (app-level)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- NVIDIA API key: https://build.nvidia.com — free tier available

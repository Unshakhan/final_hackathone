# Supportly — AI-Assisted Customer Support Desk

Supportly is a hackathon-ready customer support application where customers submit and track tickets, AI suggests an initial triage, support agents review that suggestion, both parties communicate in real time, and agents resolve tickets through a controlled workflow.

## Tech stack

- Frontend: React 19, TypeScript, Vite, React Router, Axios, Socket.IO Client
- Backend: Node.js, Express 5, TypeScript, Mongoose, Socket.IO
- Database: MongoDB Atlas
- Security: JWT authentication and bcryptjs password hashing
- AI: optional server-side OpenAI-compatible HTTP provider with a deterministic fallback

## Implemented features

- Customer registration/login and agent login with persisted JWT sessions
- Customer and agent role authorization, ownership checks, and assigned-agent checks
- Ticket creation, unique ticket numbers, automatic agent assignment, and status workflow
- Allowed categories: Billing, Technical, Account, Refund, General
- Allowed priorities: Low, Medium, High
- AI suggestion plus editable final human triage
- Persistent customer/agent messages and authenticated Socket.IO ticket rooms
- Customer and agent dashboards backed by MongoDB aggregations
- Responsive protected frontend routes, validation, loading, error, success, and empty states

## Workflow

1. A customer creates a ticket with a subject, description, and optional category.
2. The server generates a ticket number, assigns an available agent when possible, and stores a validated AI/fallback suggestion as pending review.
3. The assigned agent reviews or edits category, priority, and summary.
4. Customer and agent exchange persistent messages; Socket.IO broadcasts saved changes in real time.
5. The agent advances `New → Assigned → In Progress`, then resolves with a required resolution note.
6. Resolved tickets reject normal status changes and new messages.

## AI triage

Live AI is optional and is not active unless `AI_API_URL` and `AI_API_KEY` are configured. The backend uses native `fetch` only; no provider SDK or key is shipped to the frontend. The provider request expects an OpenAI-compatible chat-completions JSON response, times out after 8 seconds, parses structured JSON, and validates category, priority, and summary before storage. `AI_MODEL` is optional.

If configuration is absent, the provider times out, returns an error, or produces invalid JSON/values, a deterministic keyword-based fallback returns a valid category, priority, and concise summary. Ticket creation continues even when the live provider fails. Agents always make the final human review.

## Real-time events

- `ticket:join` / `ticket:leave`: enter or leave an authorized `ticket:<ticketId>` room
- `message:new`: emitted after a message is saved
- `ticket:status-updated`: emitted after a valid status save
- `ticket:resolved`: emitted after resolution is saved

Socket authentication uses the existing JWT. Room access is checked against MongoDB: customers must own the ticket and agents must be assigned to it. REST remains responsible for every database write.

## Data models

- User: name, normalized unique email, hidden hashed password, customer/agent role, timestamps
- Ticket: unique number, customer/agent references, request fields, AI suggestion, final triage/reviewer metadata, status, resolution, timestamps
- Message: ticket/sender references, sender role, message, timestamps

## Local setup

Prerequisites: Node.js 20+ and a reachable MongoDB deployment.

```bash
cd Backend
npm install
copy .env.example .env
npm run seed:demo
npm run dev
```

In another terminal:

```bash
cd Frontend
npm install
copy .env.example .env
npm run dev
```

Default local URLs are backend `http://localhost:5000` and frontend `http://localhost:5173`.

### Environment variable names

Backend: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `AI_API_URL`, `AI_API_KEY`, `AI_MODEL`

Frontend: `VITE_API_URL`, `VITE_SOCKET_URL`

Never commit real environment values. AI keys and JWT/database secrets belong only in backend deployment settings.

## Demo credentials

Run `npm run seed:demo` from `Backend` before using these accounts. The command is idempotent.

- Customer: `customer@demo.com` / `Demo123!`
- Agent: `agent@demo.com` / `Demo123!`

## API summary

- Health: `GET /api/health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Customer tickets: `POST /api/tickets`, `GET /api/tickets/my`, `GET /api/tickets/:ticketId`
- Customer messages: `GET|POST /api/tickets/:ticketId/messages`
- Agent tickets: `GET /api/agent/tickets`, `GET /api/agent/tickets/:ticketId`
- Agent workflow: `PATCH .../triage`, `PATCH .../status`, `POST .../resolve`
- Agent messages: `GET|POST /api/agent/tickets/:ticketId/messages`
- Dashboards: `GET /api/dashboard/customer`, `GET /api/dashboard/agent`

The importable collection at `docs/Supportly.postman_collection.json` contains request bodies and token variables.

## Deployment

1. Deploy `Backend` to a Node.js host and configure all required backend variables plus the deployed frontend origin in `CLIENT_URL`.
2. Deploy the `Frontend/dist` output to a static host and set `VITE_API_URL` and `VITE_SOCKET_URL` to the backend public URL before building.
3. Allow the backend host in MongoDB Atlas network access and verify WebSocket support on the host/proxy.
4. Replace deployment placeholders with the final frontend URL, backend URL, repository URL, and demo video URL before submission.

## Verification and limitations

Live API, MongoDB Atlas, authorization, workflow, dashboard, and two-client Socket.IO integration tests passed locally. Frontend build/lint and backend typecheck pass. Browser automation and a live AI provider were not tested; current AI behavior is the deterministic fallback until provider variables are configured. Deployment has not been performed.

AI coding tool used: Codex. Antigravity was not used or verified for this project.

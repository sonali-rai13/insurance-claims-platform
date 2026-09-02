# Insurance Claims Platform

A full-stack insurance claims management platform demonstrating enterprise application patterns: role-based access control, a server-enforced claim lifecycle, audit logging, and document handling — built for the German insurance market context.

Two personas are supported today: **customers** file and track claims, **claims handlers** review, assign, and progress them through a defined lifecycle. Every state change is validated server-side and recorded in an audit trail.

> **Note:** This project uses entirely synthetic data (fictional names, companies, and claim details) and is not affiliated with, or based on, any proprietary system of any insurance company.

---

## Architecture

```
                    ┌──────────────────┐
                    │    Next.js Web   │
                    │ React / TypeScript│
                    └────────┬─────────┘
                             │
                       REST (JWT auth)
                             │
                    ┌────────▼─────────┐
                    │  NestJS Backend  │
                    │                  │
                    │ Claims Service   │
                    │ Documents Service│
                    │ Auth Service     │
                    │ (AI Service —    │
                    │  planned)        │
                    └───┬─────────┬────┘
                        │         │
              ┌─────────▼──┐   ┌─▼────────────┐
              │ PostgreSQL  │   │ File storage │
              │   Prisma    │   │ (local disk, │
              │             │   │ S3-ready)    │
              └─────────────┘   └──────────────┘
```

The backend and frontend are independently deployable services communicating over a REST API

---

## Tech stack

**Frontend**
- Next.js 16 (App Router), React, TypeScript
- Tailwind CSS
- React Hook Form + Zod for schema-driven validation
- React Context for auth state

**Backend**
- NestJS, TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication (Passport), bcrypt password hashing
- class-validator for request validation
- Multer for file uploads

**Testing**
- Jest (backend unit tests — state machine logic, service layer with mocked Prisma)

**Infrastructure**
- Docker + Docker Compose (backend + PostgreSQL)
- Designed for deployment to a container platform (Railway/Render or AWS ECS Fargate + RDS + S3 for a production target)

---

## Key design decisions

A few decisions worth calling out, since they're the parts of this project meant to demonstrate judgment, not just familiarity with a framework:

**Server-enforced state machine.** Claim status transitions (`DRAFT → SUBMITTED → DOCUMENT_REVIEW → UNDER_ASSESSMENT → ... → SETTLED`) are validated by a single, centralized rules table (`claim-transitions.ts`) checked on every transition request — not scattered conditionals across controllers. Every transition also requires the correct role and, once assigned, the correct handler. The frontend has its own lightweight copy of "which actions to show," and this is a UI convenience only — the backend is the sole source of truth.

**Ownership is always derived from the JWT, never trusted from the request body.** `customerId` on claim creation, `uploadedById` on documents, and `assignedHandlerId` on assignment are all set from the authenticated user's token — never accepted as client-supplied fields. This was a deliberate rule applied consistently across every mutation in the system.

**Every state transition and document upload is atomic with its audit log entry**, using Prisma transactions — so it's not possible for a status to change without a corresponding audit record, even under partial failure.

**Document uploads are validated before any file write.** Ownership/assignment checks run against the database before touching the filesystem, avoiding a window where an unauthorized file could exist even briefly.

**No shared code package between frontend and backend.** The two apps are genuinely separate deployable units with their own dependency trees.

---

## Getting started

### Prerequisites
- Docker Desktop
- Node.js 20+

### Backend + database

```bash
cd backend
cp .env.example .env      # fill in a real JWT_SECRET
docker compose up -d      # from the repo root — starts Postgres + backend
npx prisma migrate deploy
```

Backend runs at `http://localhost:3000`.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3001`.

---

## Testing

```bash
cd backend
npm run test
```

Current coverage focuses on the highest-risk logic: the claim state machine's transition rules (valid transitions, blocked invalid transitions, terminal states, role restrictions) and `ClaimsService`'s enforcement logic (not-found handling, wrong-handler rejection, successful transition + audit log write), tested against a mocked Prisma client so the suite runs fast and without a live database.

---

## Security considerations

- Passwords hashed with bcrypt, never stored or returned in plaintext
- JWTs signed server-side; payload contains only non-sensitive claims (user id, email, role)
- Role-based access control enforced on every mutating endpoint, checked server-side — never relying on frontend UI hiding alone
- Resource-level ownership checks (a customer can only access their own claims; a handler only their assigned/unassigned claims) in addition to role checks
- Input validation on every endpoint via DTOs (class-validator), with unknown fields stripped
- Secrets managed via environment variables, injected at container runtime — never baked into Docker images
- `.env` files excluded from version control; `.env.example` files provided for setup


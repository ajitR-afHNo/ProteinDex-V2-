# Operating Directives & Hard Invariants: ProteIndex V2

This document contains the canonical engineering directives, anti-slop rules, and security guidelines for ProteIndex V2.

## Section 1: Hard Architectural Invariants (Zero Tolerance)
1. ZERO SYNTHETIC / FAKE DATA:
   - NEVER invent or hardcode fallback nutrition numbers (e.g. defaulting to 24g protein, 30g scoop, 80% purity, 1.15 DIAAS). If unverified, store NULL in PostgreSQL and display "Pending Verification" in the UI.
   - NEVER use Math.sin(), Math.random(), or random.random() to simulate price curves, review trust scores, or store offers. If history is under 2 points, display: "Price tracking initiated recently."
   - NEVER promise backend actions (such as WhatsApp/Email alerts) if the code merely saves to browser localStorage.
   - NEVER hardcode dummy FSSAI license numbers or fake lab variance percentages.

2. CORE SCHEMA INTEGRITY:
   - 4 Core Domain Tables: `products` -> `variants` -> `offers` -> `price_history`.
   - 2 Operational Support Tables: `staging_quarantine` (for quarantined/spiked listings) and `comparison_snapshots` (for shareable comparison states).
   - Migrations are sequential and append-only (`0001_initial_schema.sql`). Never edit a committed migration.

3. STRICT SECURITY & ENVIRONMENT CONFIGURATION:
   - Never use fallback mock credentials (e.g., `|| "mock-key"`). Required env vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `URL_SIGNING_SECRET`) fail fast when accessed without proper config.
   - Scrapers execute via isolated Python CLI workers or scheduled cron workers, never exposed via arbitrary web execution endpoints.
   - All outbound store links pass through an HMAC-SHA256 token verification route (`/api/out?token=...`) using `crypto.timingSafeEqual`, which injects sanitized affiliate parameters before redirecting.

4. COMPILER & TYPE DISCIPLINE:
   - `client/next.config.ts` must NEVER set `typescript: { ignoreBuildErrors: true }`.
   - Never use `// @ts-expect-error` or `// @ts-ignore` to silence type errors. Proper TypeScript narrowing is mandatory.

5. DATABASE-LEVEL PAGINATION & DATA INTEGRITY:
   - Never fetch unbounded row sets into Node.js memory to sort or paginate in JavaScript. Filtering by category, brand, price bounds, and sorting must happen at the PostgreSQL query level.
   - Primary keys (`products.id`, `variants.id`, `offers.id`) are UUIDs.

## Replit Sales Analytics

A full‑stack sales and competitor analytics application. The app provides user authentication, competitor/product management, pricing updates with history, KPI dashboards, and market trend visualizations.

### Tech Stack
- **Language**: TypeScript (Node.js + React)
- **Frontend**: React 18, Vite 5, Tailwind CSS, Radix UI primitives, shadcn/ui components, TanStack Query, Recharts
- **Backend**: Express 4, Passport (local strategy), express‑session, connect‑pg‑simple
- **Database/ORM**: PostgreSQL, drizzle‑orm, drizzle‑kit
- **Build/Tooling**: Vite, esbuild, tsx, TypeScript

### Project Structure
```
replit-sales-analytics/
  client/                 # React app (Vite)
    src/
      pages/              # Routes (dashboard, market trends, add data, etc.)
      components/         # UI components (tables, charts, modals)
      lib/, hooks/, store/ 
  server/                 # Express server
    index.ts              # App bootstrap + dev/prod serving
    routes.ts             # API routes (auth required, role checks)
    auth.ts               # Passport local strategy + session
    storage.ts            # Data access via drizzle‑orm
    db.ts                 # pg pool + drizzle init
    vite.ts               # Vite middleware in dev, static serve in prod
  shared/
    schema.ts             # drizzle schema (tables, zod helpers)
  dist/                   # Build output (server bundle + client assets)
```

### Application Flow
- **Auth & Session**
  - Local username/password via Passport; sessions stored in Postgres (`connect-pg-simple`).
  - Endpoints: `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/user`.
- **Core Entities**
  - Users (roles: `admin`, `sales_manager`, `sales_rep`)
  - Competitors, Products, CompetitorPricing, PriceHistory
- **APIs (require auth; some require roles)**
  - KPI & Analytics: `GET /api/kpi`, `GET /api/price-trends?days=30`, `GET /api/top-competitors?limit=5`
  - Competitors: `GET /api/competitors`, `POST /api/competitors` (admin/sales_manager), `PUT /api/competitors/:id` (admin/sales_manager), `DELETE /api/competitors/:id` (admin)
  - Products: `GET /api/products`, `POST /api/products` (admin/sales_manager)
  - Pricing: `GET /api/competitor-pricing` (filterable by `competitorId`, `productId`, `startDate`, `endDate`)
    - `POST /api/competitor-pricing` (auth) creates or updates pricing; automatically creates price history entries on change
    - `DELETE /api/competitor-pricing/:id` (admin/sales_manager)
  - Price History: `GET /api/price-history/:competitorPricingId`
  - Users (admin): `GET /api/users`, `PUT /api/users/:id/role`

### Environment Variables
Create a `.env` file in the project root with at least:
```
DATABASE_URL=postgresql://user:password@host:port/dbname
SESSION_SECRET=replace-with-a-long-random-string
# Optional
PORT=5000            # server listens here; Vite proxies /api to 5000 in dev
NODE_ENV=development # or production
```

### Installation
```bash
npm install
```

### Database Setup (Drizzle)
- Generate SQL (if needed):
```bash
npx drizzle-kit generate
```
- Push schema to the database (recommended):
```bash
npm run drizzle:push
```
- Explore schema/data with Drizzle Studio:
```bash
npm run drizzle:studio
```

### Running the App
- **Development (server + client concurrently)**
```bash
npm run dev:all
```
  - Server (Express) runs with `tsx` and serves API at `http://localhost:5000/api`
  - Client (Vite) runs at `http://localhost:5173` and proxies `/api` to `http://localhost:5000`

- **Development (separately)**
```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173 (proxies /api)
```

- **Production build and start**
```bash
npm run build        # builds client into dist/public and bundles server to dist/index.js
npm start            # runs Node on dist/index.js (serves API + static client)
```

### First‑Run Checklist
- Ensure Postgres is reachable at `DATABASE_URL`.
- Run `npm run drizzle:push` to create tables from `shared/schema.ts`.
- Start the app and register the initial user via the UI (`/api/register`).
- Update roles as needed via Admin endpoints/UI.

### Key Scripts
```json
{
  "dev": "NODE_ENV=development tsx -r dotenv/config server/index.ts",
  "dev:server": "NODE_ENV=development tsx -r dotenv/config server/index.ts",
  "dev:client": "vite",
  "dev:all": "concurrently -n SERVER,CLIENT -c blue,green \"npm run dev:server\" \"npm run dev:client\"",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js",
  "drizzle:generate": "drizzle-kit generate",
  "drizzle:push": "dotenv -e .env -- npx drizzle-kit push",
  "drizzle:studio": "dotenv -e .env -- npx drizzle-kit studio"
}
```

### Frontend Notes
- Routing via lightweight `wouter`.
- State and server cache via `zustand` and `@tanstack/react-query`.
- UI built with Radix primitives and shadcn/ui components.
- Charts via `recharts`.

### Backend Notes
- Sessions persisted in Postgres using `connect-pg-simple`.
- Role‑based access control via middleware in `server/routes.ts`.
- In dev, Vite middleware serves the client from source; in prod, static assets are served from `dist/public`.

### Troubleshooting
- "Could not find the build directory" on start: run `npm run build` first.
- DB connection error: verify `DATABASE_URL`, network access, and that the DB accepts connections from your environment.
- Auth failures: ensure cookies are allowed; check `SESSION_SECRET` and session table creation (it auto‑creates when using connect‑pg‑simple with `createTableIfMissing`).

### License
MIT



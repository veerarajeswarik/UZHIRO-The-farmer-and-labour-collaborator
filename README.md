# UZHIRO

UZHIRO is a smart agriculture platform for farmers, unifying farm profiles, crop
selection, cost/profit estimation, labour hiring, an AI farming assistant,
weather, farm planning, learning resources, and government scheme information
into a single platform.

This project is being built in phases (see project plan). This document is
updated as each phase lands.

## Project structure

```
UZHIRO/
├── frontend/   React + Vite app (UI)
└── backend/    Express + MongoDB REST API
```

## Status: Phase O - Testing, security, performance, UI polish, deployment (final phase)

- Phase A: Vite + React scaffold, Express app skeleton, security middleware,
  consistent API response shape, env-driven MongoDB connection.
- Phase B adds:
  - `User` model with bcrypt-hashed passwords and roles (`farmer` /
    `labourer` / `admin` - admin is not self-registrable).
  - `FarmerProfile` and `LabourerProfile` models, created automatically on
    registration based on role.
  - JWT auth: `POST /api/auth/register`, `POST /api/auth/login`,
    `GET /api/auth/me`.
  - `protect` / `authorize(...roles)` middleware, input validation via
    express-validator, a tighter rate limit on `/api/auth`.
  - Farm profile: `GET /api/farmers/profile`, `PUT /api/farmers/profile`
    (farmer role only).
  - Frontend: `AuthContext` + `useAuth`, token stored in `localStorage` and
    re-validated against `/api/auth/me` on load, `ProtectedRoute`
    (optionally role-restricted), Login/Register pages (role toggle with
    conditional labourer fields), a placeholder Dashboard, and a Farm
    Profile page wired to the new API.
- Phase C adds:
  - `Crop` model + an 8-crop prototype reference dataset (`npm run
    seed:crops` in `backend/`) - agronomic facts compiled from standard
    cultivation guidelines, explicitly labeled with `source`/`lastUpdated`,
    not live data.
  - Transparent suitability scoring engine (soil 30 / water 25 / season 25 /
    location 20 points, High ≥80 / Medium ≥60 / Low <60) with a
    per-factor, human-readable explanation - never claims a guarantee.
  - `GET /api/crops`, `GET /api/crops/:id` (public), `GET
    /api/crops/recommendations`, `GET /api/crops/compare?ids=a,b,c`
    (farmer-only, requires a completed soil/water profile).
  - Frontend: Crop Selection page (recommendation cards, season filter,
    pick 2-3 to compare), Crop Detail page, Crop Comparison table
    (highlights "Best Match" by suitability, explicitly not profitability).
- Phase D adds:
  - Example/prototype per-acre economics on each `Crop` (seed, fertilizer,
    labour, irrigation, crop protection, other cost, yield, selling price) -
    explicitly flagged `isExampleData` with a note; not live pricing. Real
    input prices (Phase E) and market prices (Phase F) will replace these
    without changing the calculation engine.
  - `services/profitCalculator.service.js` - pure, unit-tested function
    implementing exactly: Total Cost = Seed + Fertilizer + Labour +
    Irrigation + Protection + Other; Expected Yield = Yield/acre × Acres;
    Revenue = Yield × Price; Profit = Revenue − Total Cost. See
    `backend/tests/profitCalculator.test.js` (`npm test` in `backend/`).
  - `POST /api/profit/estimate` (farmer-only): defaults land area from the
    farm profile, defaults costs/yield/price from the crop's example
    economics, and lets the farmer override any field - the response says
    exactly which fields are still example data vs. farmer-supplied.
  - Frontend: Cost & Profit Estimator page (crop picker, editable fields
    each labeled "Example" or "Your value", full results table), linked
    from Crop Detail and the nav.
- Phase E adds:
  - `Product` model (seeds/fertilizers/organic manure/pesticides/farming
    tools) with a real, individually verified `purchaseUrl` per item where
    one exists, or `null` where it doesn't - never a fabricated link. All
    verified links point to BigHaat.com (a real Indian agri-input
    marketplace); each was actually fetched and confirmed live before being
    added (`backend/src/data/productSeed.js` documents what was verified
    for each one). Two items (Sugarcane setts, Ragi seed) intentionally
    have no purchase link, since none could be verified - the UI shows
    "Purchase link unavailable" for these instead of guessing.
  - `npm run seed:products` in `backend/` (run after `seed:crops`).
  - `GET /api/products`, `GET /api/products/:id` (public), `GET
    /api/products/for-crop/:cropId` (farmer-only) - builds a shopping
    checklist: seed quantity/cost computed from the crop's seed rate ×
    land area, fertilizer/crop-protection costs reusing the same per-acre
    figures as the Phase D estimator, plus optional organic manure/tools.
  - Frontend: Input Shopping List page (crop + land area picker, per-category
    cards with quantity, estimated cost, and a real "View / Buy" link or an
    explicit "Purchase link unavailable"), linked from Crop Detail and the
    Cost & Profit Estimator results.
- Phase F adds:
  - `MarketPrice` model - populated ONLY from real fetched data, never
    seeded with invented prices.
  - `services/marketPrice.service.js` - integrates the real data.gov.in
    Agmarknet dataset ("Current Daily Price of Various Commodities from
    Various Markets / Mandi", Ministry of Agriculture & Farmers Welfare).
    Activates when `AGMARKNET_API_KEY` is set in `backend/.env` (get a free
    key at data.gov.in). Without a key - or if the source can't be reached -
    it honestly reports the price as unavailable and falls back to the
    Phase D example price, never fabricating a number. Successful fetches
    are cached for 3 days.
  - `GET /api/market-prices?crop=<name>`, `GET /api/market-prices/:cropId`
    (public) - returns live price + "Price data updated on..." + source
    when available, or a labeled fallback when not.
  - `POST /api/profit/estimate` now tries a live market price for the
    selling price before the Phase D example
    (`fieldSources.sellingPricePerKg`: `'user-provided'` | `'market-price'`
    | `'example'`), and returns `marketPrice` metadata (market, date,
    source) when one was used.
  - Frontend: market price panel on Crop Detail, market-price source/date
    badge on the Cost & Profit Estimator's results when applicable.
  - **Note:** this sandboxed dev environment cannot reach api.data.gov.in
    (connection times out), so the live-fetch path could not be tested
    end-to-end here - only the fallback path (which is what actually runs
    without a configured key). The integration logic itself (parsing,
    caching, unit conversion from ₹/quintal to ₹/kg) was verified by
    inserting a simulated cached record and confirming both endpoints
    consume it correctly.
- Phase G adds:
  - `LabourerProfile` extended with `description`, `workHistory[]`, and
    system-managed `rating`/`ratingCount` (`null`/`0` for real accounts -
    there's no review feature yet, so this stays honest rather than
    fabricated; demo profiles carry illustrative example ratings, flagged
    `isDemoData`).
  - `HiringRequest` model with a real state-transition matrix: farmer can
    Cancel a Pending/Accepted request or mark Accepted → Completed;
    labourer can Accept/Reject a Pending request or mark Accepted →
    Completed. Contact phone numbers are only revealed to each other once
    a request reaches Accepted/Completed - not before.
  - `GET/PUT /api/labourers/profile` (labourer, own profile), `GET
    /api/labourers` (farmer-only search: location/work type/availability/
    min experience/max wage, "X labourers found" / "No labourers found
    matching your requirements."), `GET /api/labourers/:id`.
  - `POST /api/hiring`, `GET /api/hiring/farmer`, `GET /api/hiring/labourer`,
    `PUT /api/hiring/:id/status`.
  - `npm run seed:labourers` in `backend/` - 6 **fictional** demo labourer
    accounts (generic composite names, not real people) so the marketplace
    has something to browse/search/hire against in development, per the
    "never use real people's information as fake demo data" rule.
  - Frontend: Labour Marketplace (search/filter), Labourer Detail + hiring
    request form, My Hiring Requests (role-aware: farmer and labourer both
    use it, each sees appropriate actions), Labourer's own profile editor.
- Phase H adds:
  - Real, live weather via [Open-Meteo](https://open-meteo.com) - free,
    no API key required, and verified actually working end-to-end from
    this environment (unlike the Phase F market price source).
    `services/geocoding.service.js` resolves the farmer's free-text
    location to coordinates (in-memory cache only, never persisted as a
    weather "record"); `services/weather.service.js` fetches current
    conditions + a 5-day forecast fresh on every request (weather changes
    fast, so nothing is cached as "current") and maps the real WMO weather
    codes to plain-language descriptions.
  - Deterministic, rule-based farming insights and alerts (e.g. rain
    expected → irrigation may be less necessary; heavy rain/thunderstorm/
    high wind → caution alerts) - hedged language throughout ("may",
    "consider", "monitor"), never a certain claim.
  - `GET /api/weather` (farmer-only, optional `?location=` override) -
    dated (`fetchedAt`) and sourced on every response; honestly errors
    (404/503) if a location can't be resolved or the source is
    unreachable, rather than fabricating data.
  - Frontend: Weather page (current conditions, alerts, insights, 5-day
    forecast, source/fetched-at label, location override).
- Phase I adds:
  - `FarmTask` model: title, type (Planting/Irrigation/Fertilizer/Pest
    Monitoring/Harvest/General), optional crop link, due date, notes,
    status (Pending/Completed).
  - `POST/GET /api/tasks`, `PUT /api/tasks/:id`, `PUT
    /api/tasks/:id/complete`, `DELETE /api/tasks/:id` - all scoped to the
    logged-in farmer (ownership enforced on every write).
  - `POST /api/tasks/generate-from-crop` - the "generate recommended tasks
    from the crop's cultivation stages" feature: creates one task per real
    cultivation stage, evenly spaced across the crop's actual
    `cultivationDurationDays`. This distributes real data we have (stage
    count + duration), not invented day-by-day agronomy - every generated
    task is flagged `isAutoGenerated` and its notes say the timing is
    approximate and should be adjusted.
  - Frontend: Farm Planner page - add/edit/delete/complete tasks, filter by
    status/type, and a "Generate tasks from a crop" form.
- Phase J adds:
  - AI Farming Assistant backed by the real Anthropic Claude API
    (`claude-opus-5`), called only from the backend -
    `services/ai.service.js` - the API key (`ANTHROPIC_API_KEY`) never
    reaches the frontend. Without a configured key, `POST /api/ai/chat`
    honestly returns 503 rather than fabricating a reply (verified: no key
    is set in this dev environment, and the endpoint responds instantly
    with a clear "temporarily unavailable" message instead of hanging or
    guessing).
  - The system prompt (verified directly, see phase notes) always carries:
    hedged, non-guarantee language; an instruction to recommend a local
    agricultural extension officer for high-stakes decisions; an explicit
    rule never to state a market price/product availability as fact unless
    it's given in context; and a rule never to invent specific agronomic
    facts. Structured farmer context (location, soil, water, land area,
    season, optionally a selected crop's real data, optionally live
    weather) is attached automatically.
  - Chat history is stored **only** when the farmer explicitly opts in per
    message (`saveHistory: true`, driven by a "Save my chat history"
    checkbox, unchecked by default) - `AIConversation` model, `GET/DELETE
    /api/ai/history` so farmers can review or clear what's stored.
  - Frontend: AI Assistant chat page (optional crop/weather context
    toggles, consent checkbox, clear-history control, shows which context
    was used and the guidance disclaimer after each answer).
- Phase K adds:
  - `GET /api/crops/:id/explain` (farmer-only) - the deterministic
    suitability score from Phase C is **always** computed and returned in
    full; an AI elaboration ("why this crop may suit your farm",
    advantages, considerations, how to prepare) is layered on top using
    Claude's structured JSON output, grounded strictly in the crop's real
    documented advantages/considerations/cultivation stages and the real
    score breakdown - the prompt explicitly forbids contradicting the score
    or inventing new agronomic facts. When the AI is unavailable (no key,
    as in this dev environment), `aiExplanation.available` is `false` and
    the endpoint still returns the complete deterministic score/explanation
    on its own - verified end-to-end (0.09s response, correct 86/High
    score matching Phase C's known values, honest `aiExplanation`
    fallback).
  - Frontend: "Why this crop may suit your farm" panel on Crop Detail
    (opt-in button, not auto-fetched, since it's an AI call), clearly
    labeled "AI-generated", with a graceful fallback message when
    unavailable.
- Phase L adds:
  - `LearningArticle` model + 10 articles (`npm run seed:learning`), one
    per required category (Crop cultivation, Soil management, Water
    management, Pest management, Natural farming, Organic farming, Seed
    selection, Harvesting, Storage, Market awareness) - general awareness
    content, clearly labeled as compiled guidance, not verbatim official
    text, with several articles cross-referencing the app's own Soil
    Health Card / e-NAM / Weather / Market Price features.
  - `GovernmentScheme` model + 6 real Indian central government
    agricultural schemes (`npm run seed:schemes`): PM-KISAN, PMFBY (crop
    insurance), Kisan Credit Card, Soil Health Card Scheme, PMKSY
    (irrigation), and e-NAM. Every scheme's eligibility/benefits were
    researched against real sources before being written, and every
    `officialSourceUrl` was individually fetched and confirmed to be a
    real, live official government page before inclusion (pmkisan.gov.in,
    pmfby.gov.in, jansamarth.in, soilhealth.dac.gov.in, pmksy-mowr.nic.in,
    enam.gov.in) - nothing here was guessed, and figures that vary by
    state or time are stated as such rather than given as fixed numbers.
  - `GET /api/learning` (+ category/search filter), `GET /api/learning/:id`,
    `GET /api/schemes` (+ category filter), `GET /api/schemes/:id` - all
    public, no login required.
  - Frontend: Learning Hub (category filter, search, article list/detail)
    and Government Schemes (expandable cards with eligibility, benefits,
    application info, and a real "Official website" link per scheme) -
    both linked in the nav for logged-in users of either role.
- Phase M adds:
  - `GET /api/dashboard` (farmer or labourer) - a single aggregation
    endpoint rather than the frontend orchestrating many parallel calls.
    For farmers it reuses every prior phase's real logic in place (Phase C
    scoring for the top crop, Phase D's calculator + Phase F's market price
    for the financial summary, Phase H's live weather, Phase I's tasks,
    Phase G's hiring requests, Phase L's articles) - verified end-to-end
    against the real seeded farmer account and every number matched the
    already-known values from those phases exactly (e.g. Groundnut 86/High,
    ₹80,840 / ₹2,06,800 / ₹1,25,960). Every section degrades gracefully
    instead of erroring the whole dashboard - verified with a farmer who
    hasn't completed their profile yet (farm summary shows nulls,
    recommendation/financial summary are honestly `null`, nothing crashes).
    Labourers get a smaller, real equivalent (own profile summary + recent
    hiring requests).
  - Frontend: the Dashboard page now summarizes rather than duplicates -
    quick action buttons (Find Crops, Compare Crops, Estimate Profit, Find
    Labour, Ask AI) plus compact cards for each section, each linking out
    to its full page.
- Phase N adds:
  - Admin accounts are **never** self-registrable - `npm run create:admin
    -- <email> <password> [name] [phone] [location]` in `backend/` is the
    only way to provision one (CLI-only, zero public attack surface for
    privilege escalation).
  - `/api/admin/*` - every route gated by `protect + authorize('admin')`,
    verified end-to-end: a farmer token gets 403, no token gets 401.
    Covers Users (list/filter/search, activate/deactivate - ties directly
    into the existing login gate from Phase B, hard delete with cascade
    cleanup of the farmer/labourer profile), Crops, Products, Learning
    Articles, and Government Schemes (full create/edit/delete on each),
    Market Data (view cached records, manually add/edit/delete - manual
    entries are honestly labeled `"Manually entered by admin"`, verified
    to flow through correctly to the public Market Price endpoint rather
    than being confused with real Agmarknet data), and Reports (real,
    live-computed counts - users by role/status, content counts, hiring
    requests by status - never a static or fabricated figure).
  - Self-protection: an admin cannot deactivate or delete their own
    account (tested).
  - Centralized error handling improved to translate Mongoose validation
    errors (400), cast errors (400), and duplicate-key errors (409)
    instead of falling through to a generic 500 - benefits every admin
    create/edit endpoint.
  - Frontend: an Admin section (nav item shown only for `role: 'admin'`,
    and non-admin users are redirected away from `/dashboard` to `/admin`
    if they somehow have an admin session) with a live reports overview
    plus list+form pages for Users, Crops, Products, Market Data, Learning
    Content, and Government Schemes.
- Phase O (final phase) adds:
  - **Testing**: `backend/tests/` now has 51 passing tests across 3 suites
    (`npm test` in `backend/`) - `profitCalculator.test.js` (6, math
    correctness per the spec's exact formulas), `cropScoring.test.js` (25,
    every branch of the suitability engine: soil/water/season/location
    scoring, weight totals, score bounds, level thresholds), and
    `api.integration.test.js` (20, real HTTP requests via supertest against
    a dedicated `uzhiro_test` database - registration/login/validation,
    password hashing verification, protected-route auth, role-based
    authorization across farmer/labourer/admin routes, and NoSQL-injection
    hardening). Integration tests never touch the dev database.
  - **Security hardening**: `express-mongo-sanitize` strips any
    `$`/`.`-prefixed key from `req.body`/`query`/`params` globally,
    closing a real NoSQL-operator-injection path through query strings
    (verified with a test that attempts `role[$ne]=x`); every user-supplied
    string that reaches `new RegExp()` is now escaped
    (`utils/regex.js`) to prevent ReDoS and pattern injection in search
    endpoints; `server.js` refuses to start in production with a missing,
    placeholder, or too-short `JWT_SECRET` (warns in development).
  - **Performance**: `compression` (gzip) added for all API responses
    (verified via `Content-Encoding: gzip`); the frontend now code-splits
    every route with `React.lazy`/`Suspense` - the initial JS bundle
    dropped from ~377KB to ~271KB, and the 7 admin-only pages (~24KB)
    load only when an admin actually navigates there, never for farmers
    or labourers.
  - **UI polish**: rebuilt the Landing page (hero section, feature
    overview, role-aware redirect to `/dashboard` if already logged in)
    and added a reusable `Spinner`/`PageLoading` component for consistent
    loading states.
  - **Deployment readiness**: see the Deployment section below.

## Getting started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGODB_URI, JWT_SECRET, etc.
npm run dev            # starts on http://localhost:5000
```

The server will start even without a configured `MONGODB_URI` in
development (it logs a warning) so the API skeleton can be exercised before
a database is wired up. In production, a missing/failed DB connection is
fatal.

Health check: `GET http://localhost:5000/api/health`

Create the first admin account (never done via the public register form):
```bash
npm run create:admin -- admin@example.com YourPassword123 "Admin Name" 9000000000 India
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:5173
```

## Environment variables

See `backend/.env.example` for the full list. Never commit a real `.env`
file - it is already covered by `.gitignore`.

## Testing

```bash
cd backend
npm test
```

Runs 51 tests across 3 suites: two are pure unit tests with no external
dependency (`profitCalculator.test.js`, `cropScoring.test.js`); the third
(`api.integration.test.js`) makes real HTTP requests against the Express
app via `supertest`, backed by a dedicated `uzhiro_test` MongoDB database
(auto-derived from `MONGODB_URI`, dropped after each run) - it never reads
or writes the dev database. Requires a reachable MongoDB, same as running
the app itself. Rate limiters are automatically relaxed when `NODE_ENV`
is `test` (which Jest sets by default) so the suite's many auth calls
don't trip the same limits a real client would hit.

## Security notes

- Passwords are hashed with bcrypt; the raw password is never stored,
  logged, or returned by any API response (verified by a test).
- JWT auth on every protected route; role-based `authorize()` middleware
  enforces farmer/labourer/admin boundaries (verified by tests covering
  all three roles). Admin accounts cannot be created through any public
  endpoint - `npm run create:admin` is the only path.
- `express-mongo-sanitize` strips `$`/`.`-prefixed keys from
  `req.body`/`query`/`params`, closing NoSQL operator injection via query
  strings or JSON bodies (verified by tests).
- All user-supplied search text is escaped before use in `new RegExp()`
  (`backend/src/utils/regex.js`) to prevent ReDoS/regex injection.
- `helmet`, scoped `cors` (only `CLIENT_URL` is allowed), and tiered rate
  limiting (300 req/15min general API, 20 req/15min auth, 30 req/15min AI
  chat) are active by default.
- `backend/src/server.js` refuses to start in production with a missing,
  placeholder, or under-32-character `JWT_SECRET`.
- Centralized error handling never leaks stack traces to clients in
  production, and translates Mongoose validation/cast/duplicate-key
  errors into proper 400/409 responses instead of a generic 500.

## Performance notes

- API responses are gzip-compressed (`compression` middleware).
- The frontend code-splits every route via `React.lazy`/`Suspense` - the
  initial bundle is ~271KB (down from ~377KB monolithic); the 7 admin-only
  pages load on demand and never ship to farmer/labourer sessions.
- MongoDB indexes are set on frequently-queried fields (user email,
  crop/product name, labourer work types/availability, task due date,
  hiring request status, etc.) - see each model file.

## Deployment

This is a prototype-grade deployment guide, not a hardened production
runbook - review the Security notes above and your hosting provider's
guidance before going live with real user data.

**Backend** (plain Node/Express, no build step):
```bash
cd backend
npm install --omit=dev
NODE_ENV=production npm start
```
- Requires a real MongoDB (Atlas or self-hosted), a strong `JWT_SECRET`
  (32+ random characters - the app refuses to start in production
  without one), and `CLIENT_URL` set to your deployed frontend's origin.
- Run behind a process manager (e.g. PM2, systemd) and a reverse proxy
  (e.g. Nginx) that terminates TLS; the app itself serves plain HTTP.
- Optional integrations activate only when their key is set:
  `AGMARKNET_API_KEY` (live market prices) and `ANTHROPIC_API_KEY` (AI
  assistant) - both are designed to degrade gracefully and never fabricate
  data when unset, so deploying without them is safe, just less capable.
- Seed reference data after first deploy: `npm run seed:crops`, `npm run
  seed:products`, `npm run seed:learning`, `npm run seed:schemes` (and
  optionally `npm run seed:labourers` for demo marketplace data), then
  `npm run create:admin -- <email> <password> ...`.

**Frontend** (static build):
```bash
cd frontend
npm install
VITE_API_URL=https://your-api-domain.com/api npm run build
```
- Outputs static files to `frontend/dist/` - deploy to any static host
  (Netlify, Vercel, S3+CloudFront, Nginx, etc.).
- Because this is a client-side-routed SPA, the host must rewrite unknown
  paths to `index.html` (e.g. Netlify's `_redirects`, Vercel's
  `rewrites`, or Nginx `try_files ... /index.html`).

## Data honesty

UZHIRO never fabricates market prices, purchase links, or agricultural
data. Anywhere prototype/example values are shown, they are explicitly
labeled as estimates. This rule is enforced from Phase A onward and applies
to every later phase (cost/profit estimator, market prices, product
purchase links, weather, AI assistant).

# cineverse-frontend

The React client for [Cineverse](https://github.com/SuryaKiran434/Cineverse) — a
movie discovery and watch-tracking app. Users register, log in, browse movies by
genre, search, open a detail page with streaming providers, and maintain two
lists: a **watchlist** (want to see) and a **watched** list (already seen).

Built with **React 19**, **React Router 7**, **Tailwind CSS** and **Vite 6**.

> **Read [Security: `VITE_` variables are public](#security-vite_-variables-are-public)
> before adding any environment variable to this project.**

---

## Contents

- [Architecture](#architecture)
- [Routing](#routing)
- [Pages and components](#pages-and-components)
- [Talking to the backend](#talking-to-the-backend)
- [State management](#state-management)
- [Build tooling](#build-tooling)
- [Testing](#testing)
- [Running locally](#running-locally)
- [Security: `VITE_` variables are public](#security-vite_-variables-are-public)
- [Known rough edges](#known-rough-edges)

---

## Architecture

```
   index.html
       │  <script type="module" src="/src/main.jsx">
       ▼
   src/main.jsx
       │  ReactDOM.createRoot(#root)
       │  └─ <BrowserRouter>            react-router-dom
       ▼
   src/App.jsx                     ── the route table
       │
       │  <PrivateRoute> = localStorage.getItem("token") ? children
       │                                                 : <Navigate to="/login">
       │
       ├── /            Landing        public
       ├── /login       Login          public   ── POST /login  → stores token + user_id
       ├── /register    Register       public   ── POST /register
       ├── /home        Home           private  ┐
       ├── /search      Search         private  │  each renders <Navbar/>
       ├── /watchlist   Watchlist      private  │  and fetches on mount
       ├── /watched     Watched        private  │
       └── /movie/:id   MovieDetails   private  ┘
                        │
                        ▼
        ┌───────────────────────────────────────────────┐
        │  fetch() / axios, Authorization: Bearer <JWT>  │
        └───────┬───────────────────────────┬───────────┘
                │                           │
                ▼                           ▼
   ┌────────────────────────┐   ┌──────────────────────────────┐
   │  Cineverse backend     │   │  api.themoviedb.org/3        │
   │  http://127.0.0.1:8000 │   │  called DIRECTLY from the    │
   │                        │   │  browser with                │
   │  /login /register      │   │  VITE_TMDB_API_KEY           │
   │  /watchlist /watched   │   │                              │
   │  /recommendations      │   │  ⚠️  MUST BE REMOVED — see    │
   │  /tmdb/*  (proxy)      │   │      Security below           │
   └───────────┬────────────┘   └──────────────────────────────┘
               │
               ▼
          MySQL + TMDB (server-side, key never exposed)
```

There is **no API client module and no global store**. Every page owns its own
`useState` + `useEffect` and calls `fetch` (or, in `Search`, `axios`) inline
with a hard-coded `http://127.0.0.1:8000` base URL. Auth state is a JWT string
in `localStorage`.

---

## Routing

Declared in `src/App.jsx` with `react-router-dom` v7. `<BrowserRouter>` wraps
the app in `src/main.jsx`.

| Path | Component | Access | Notes |
|---|---|---|---|
| `/` | `pages/Landing` | Public | Hero image with Register / Login buttons |
| `/login` | `pages/Login` | Public | On success stores `token` and `user_id`, redirects to `/home` |
| `/register` | `pages/Register` | Public | Sign-up form |
| `/home` | `pages/Home` | Private | Genre rows plus personalised recommendations |
| `/search` | `pages/Search` | Private | Reads `?query=` from the URL |
| `/watchlist` | `pages/Watchlist` | Private | The user's saved movies |
| `/watched` | `pages/Watched` | Private | The user's watched movies |
| `/movie/:id` | `pages/MovieDetails` | Private | Detail page, providers, add-to-list actions |

`PrivateRoute` is a small wrapper in `App.jsx`:

```jsx
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}
```

It only checks that a token *exists* — it does not validate or decode it. An
expired token still renders the page; the API calls inside then fail with 401.

`<Routes>` is keyed on `location.pathname`, which forces a remount on every
navigation so each page re-runs its fetch effects.

---

## Pages and components

### `src/pages/`

| File | What it does |
|---|---|
| `Landing.jsx` | Unauthenticated hero over `/Landing.png`, with Register and Login buttons |
| `Login.jsx` | `POST /login`; on success writes `token` and `user_id` to `localStorage` and navigates to `/home`. Password show/hide via `react-icons`. |
| `Register.jsx` | `POST /register` with first name, last name, email, password |
| `Home.jsx` | Fetches the TMDB genre list, then a random page of `/discover/movie` per genre, rendering a horizontally scrollable row each; separately fetches `GET /recommendations` from the backend |
| `Search.jsx` | Reads `?query=` from the URL, calls `GET /tmdb/search` on the backend via `axios`, renders results in a 4-column grid, falls back to `/noimage.jpg` when a poster is missing |
| `MovieDetails.jsx` | The detail page wired into the router. Movie data from TMDB directly; streaming providers from `GET /tmdb/movie/{id}/providers`; "add to watchlist" / "mark watched" buttons |
| `Watchlist.jsx` | A wrapper over `components/MovieCollectionPage` supplying `collection="watchlist"` and its own heading and empty-state copy |
| `Watched.jsx` | The same wrapper with `collection="watched"` |
| `Account.jsx` | Placeholder — renders `<h1>Account Page</h1>` and is **not routed** |

### `src/components/`

| File | What it does |
|---|---|
| `MovieCollectionPage.jsx` | The grid behind both list pages: `GET /{collection}`, `DELETE /{collection}/remove/{movie_id}` per row, redirect to `/login` when no token is stored, and five-column rows padded so the last row keeps its column widths. `Watchlist.jsx` and `Watched.jsx` were byte-identical apart from five strings before this was extracted, which is why the `assertMovieId` guard had to be written twice. |
| `Navbar.jsx` | Fixed top bar: Home / Watchlist / Watched links, a Logout button that clears `localStorage.token` and redirects to `/login`, and a search form rendered only on `/home` that navigates to `/search?query=…` |
| `MovieDetails.jsx` | **Unused.** An earlier, simpler detail view. `App.jsx` imports `pages/MovieDetails`, not this one. |

`Navbar` is rendered by each private page individually rather than by a shared
layout route.

### `public/`

`Landing.png`, `CINEVERSE.jpg` (favicon), `NewLogo.png`, `noimage.jpg` (poster
fallback), `vite.svg`.

---

## Talking to the backend

The Cineverse backend runs at **`http://127.0.0.1:8000`** and its CORS
configuration allows exactly `http://localhost:5173` — the Vite dev server
default.

Endpoints this client calls:

| Call site | Method | Endpoint | Auth |
|---|---|---|---|
| `Login.jsx` | `POST` | `/login` | — |
| `Register.jsx` | `POST` | `/register` | — |
| `Home.jsx` | `GET` | `/recommendations` | Bearer |
| `Search.jsx` | `GET` | `/tmdb/search?query=` | — |
| `MovieDetails.jsx` | `GET` | `/tmdb/movie/{id}/providers` | — |
| `MovieDetails.jsx` | `POST` | `/watchlist/add` | Bearer ¹ |
| `MovieDetails.jsx` | `POST` | `/watched/add` | Bearer |
| `MovieCollectionPage.jsx` | `GET` | `/watchlist` · `/watched` | Bearer |
| `MovieCollectionPage.jsx` | `DELETE` | `/{collection}/remove/{movie_id}` | Bearer |

¹ `MovieDetails.jsx` still puts a `user_id` in the `/watchlist/add` body as well.
The backend ignores it — it derives the watchlist owner from the verified token
and its request model has no `user_id` field — so the field is vestigial and can
be dropped from the payload.

Authenticated calls attach the token read straight out of `localStorage`:

```js
headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
```

Two pages — `Home.jsx` and `pages/MovieDetails.jsx` — **bypass the backend and
call `api.themoviedb.org` directly** from the browser using
`import.meta.env.VITE_TMDB_API_KEY`. That is the exposure described below and
should be migrated onto the backend's `/tmdb/*` proxy routes.

The base URL is currently hard-coded in every call site. `VITE_API_BASE_URL` is
provided in `.env.example` as the intended single knob for it.

---

## State management

No Redux, no Context, no data-fetching library. Deliberately minimal:

| Concern | Mechanism |
|---|---|
| Server data | `useState` + `useEffect` per page, re-fetched on every mount |
| Auth token | `localStorage.token`, written at login, cleared at logout |
| User id | `localStorage.user_id`, written at login |
| Route guard | `PrivateRoute` reading `localStorage.token` |
| Search query | The `?query=` URL search param, read with `useLocation` |
| Remount on navigation | `<Routes key={location.pathname}>` |

Because `<Routes>` is keyed on the path, navigating between pages discards
component state and re-issues every request — there is no cache.

---

## Build tooling

| Tool | Version | Role |
|---|---|---|
| Vite | 6 | Dev server, bundler; JSX via `@vitejs/plugin-react`, so Fast Refresh works |
| React | 19 | UI |
| React Router | 7 | Client-side routing |
| Tailwind CSS | 4 | Utility CSS, via `@tailwindcss/vite` |
| ESLint | 9 | Flat config in `eslint.config.js`, with the React / hooks / refresh plugins |
| `lucide-react`, `react-icons` | — | Icons |
| `react-transition-group` | — | Transitions |

Config files: `vite.config.js` (Vite, Tailwind and Vitest), `eslint.config.js`,
`sonar-project.properties`. Tailwind v4 needs no `tailwind.config.js`, and there is no
PostCSS config — routing Tailwind through both the Vite plugin and PostCSS ran it twice
over the same stylesheet, so the PostCSS copy was removed.

Styling is a mix of Tailwind utility classes and large inline `style={{…}}`
objects, plus a little hand-written CSS in `src/index.css` and `src/App.css`.

### Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Dev server with HMR on **http://localhost:5173** |
| `npm run build` | `vite build` | Production bundle into `dist/` |
| `npm run preview` | `vite preview` | Serve the built bundle locally |
| `npm run lint` | `eslint .` | Lint |
| `npm run test` | `vitest run` | Unit tests |
| `npm run test:coverage` | `vitest run --coverage` | Unit tests plus `coverage/lcov.info` for SonarCloud |

---

## Testing

```bash
npm run test              # 47 tests
npm run test:coverage     # plus coverage/lcov.info
```

Vitest with jsdom and `@testing-library/react`. CI (`.github/workflows/ci.yml`,
job **Frontend (Node 20)**) runs `npm ci`, `npm run build` and `test:coverage`,
then the SonarCloud scan in the same job, so the report exists when the scanner
looks for it — a source file Sonar analyses but cannot find in a coverage report
is scored 0% covered rather than unmeasured. `npm run lint` and `npm audit` run
last as non-blocking, informational steps.

Two more workflows sit alongside it: `slack-notify.yml` posts a push
notification, and `dependabot-auto-merge.yml` queues Dependabot's grouped
patch/minor pull requests to merge once the required checks go green — majors
are excluded and wait for a human. `.github/dependabot.yml` collapses each
ecosystem (`npm`, `github-actions`) into one grouped pull request per week.

| Suite | Covers |
|---|---|
| `src/utils/__tests__/movieId.test.js` | `assertMovieId`, case by case: traversal sequences, slashes, query and fragment characters, encoded traversal, non-integers, and the non-string inputs |
| `src/components/__tests__/MovieCollectionPage.test.jsx` | The unauthenticated redirect, both collections, the empty and missing-key states, the poster fallback, the failure paths that only reach `console.error`, and that a `movie_id` failing validation produces **no** `DELETE` at all |
| `src/pages/__tests__/collections.test.jsx` | That each wrapper passes its own endpoint and copy |

`assertMovieId` is a security control — it is what keeps a traversal sequence out of a
request URL path, since `encodeURIComponent` leaves `..` intact inside a path segment —
so its rejection cases are pinned individually rather than sampled. The four files
above sit at 100%. The rest of `src/` has no tests yet.

One documented quirk: `assertMovieId(true)` returns `1`, because `Number(true) === 1`.
That is safe — the contract is that whatever reaches the path is a bare integer — so it
is pinned as behaviour rather than tightened.

---

## Running locally

### 1. Prerequisites

- **Node 20** (or newer) and npm
- The [Cineverse backend](https://github.com/SuryaKiran434/Cineverse) running on
  `http://127.0.0.1:8000` — this app is not usable without it

### 2. Install

```bash
git clone https://github.com/SuryaKiran434/cineverse-frontend.git
cd cineverse-frontend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

| Variable | Purpose | Secret? |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the Cineverse backend, e.g. `http://127.0.0.1:8000` | **No** — a public URL, safe to inline |

Only variables prefixed `VITE_` are exposed to the app, via
`import.meta.env.VITE_*`. **That prefix means "publish this to the world" — see
the section below.** `.env` is git-ignored; commit only `.env.example`.

### 4. Run the dev server

```bash
npm run dev
```

Opens on **http://localhost:5173**. Use `localhost`, not `127.0.0.1` — the
backend's CORS `allow_origins` lists `http://localhost:5173` specifically, and
the two are different origins to a browser.

### 5. Build for production

```bash
npm run build     # → dist/
npm run preview   # serve dist/ locally to check it
```

---

## Security: `VITE_` variables are public

**Anything in a `VITE_`-prefixed environment variable is compiled into the
JavaScript bundle that ships to the browser. It is not a secret. It is
published.**

Vite performs a literal text substitution at build time: every
`import.meta.env.VITE_FOO` in the source becomes the value of `VITE_FOO`
inlined into the output in `dist/assets/*.js`. There is no server, no runtime
lookup, and nothing hidden. Any visitor can read the value by opening DevTools,
viewing the bundle, or running `grep` over a downloaded copy of the site.

**This has already happened in this repository.** A TMDB API key was placed in
`VITE_TMDB_API_KEY`, and `src/pages/Home.jsx` and `src/pages/MovieDetails.jsx`
still use it to call `api.themoviedb.org` straight from the browser. The key was
therefore embedded in every production build and readable by anyone who loaded
the site. A committed `.env` made it worse. That key must be treated as
compromised and rotated in the TMDB dashboard; deleting it from the code does
not un-publish an already-shipped bundle.

### The rules

1. **No secret may ever be placed in a `VITE_` variable.** Not API keys, not
   tokens, not passwords, not connection strings. If leaking it would matter, it
   cannot go here.
2. **TMDB must be called through the Cineverse backend.** The backend already
   exposes proxy routes for exactly this purpose — `/tmdb/movie/{id}`,
   `/tmdb/genres`, `/tmdb/search`, `/tmdb/movie/{id}/providers`,
   `/tmdb/movie/{id}/recommendations`. The browser calls Cineverse, Cineverse
   holds the key and calls TMDB. The key never leaves the server.
3. **`VITE_` is only for public configuration** — a backend base URL, a feature
   flag, a public analytics id. Things you would be content to print on the
   homepage.
4. **Never commit `.env`.** It is git-ignored; `.env.example` carries
   placeholders only.
5. **A key that has shipped in a bundle is burned.** Rotate it. Removing the
   code is necessary but not sufficient.

### Outstanding work

`Home.jsx` and `pages/MovieDetails.jsx` should be migrated to the backend's
`/tmdb/*` routes, and `VITE_TMDB_API_KEY` removed from this project entirely.
Until that lands, the deployment is only safe with a key that has been rotated
and scoped as disposable.

---

## Known rough edges

Documented so they are not mistaken for design:

- **`VITE_TMDB_API_KEY` is still read** by `Home.jsx` and
  `pages/MovieDetails.jsx`. See the section above.
- **The backend URL is hard-coded** as `http://127.0.0.1:8000` in 14 places across
  9 files rather than read from `VITE_API_BASE_URL`, so the app cannot be pointed at
  a deployed backend without editing source. `MovieCollectionPage.jsx` holds it in a
  single `API_BASE` constant, which is the shape the rest should move to.
- **`src/components/MovieDetails.jsx` is dead code** — superseded by
  `src/pages/MovieDetails.jsx`.
- **`src/pages/Account.jsx` is an unrouted placeholder.**
- **`PrivateRoute` only checks that a token string exists**, never that it is
  valid or unexpired.
- **Only `src/utils` and the two collection pages have tests.** The remaining pages
  and components have none, so the project-wide coverage figure is low by design
  rather than by accident.

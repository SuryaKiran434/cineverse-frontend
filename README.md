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
| `Watchlist.jsx` | `GET /watchlist`, with `DELETE /watchlist/remove/{movie_id}` per row |
| `Watched.jsx` | `GET /watched`, with `DELETE /watched/remove/{movie_id}` per row |
| `Account.jsx` | Placeholder — renders `<h1>Account Page</h1>` and is **not routed** |

### `src/components/`

| File | What it does |
|---|---|
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
| `MovieDetails.jsx` | `POST` | `/watchlist/add` | — (sends `user_id` in the body) |
| `MovieDetails.jsx` | `POST` | `/watched/add` | Bearer |
| `Watchlist.jsx` | `GET` | `/watchlist` | Bearer |
| `Watchlist.jsx` | `DELETE` | `/watchlist/remove/{movie_id}` | Bearer |
| `Watched.jsx` | `GET` | `/watched` | Bearer |
| `Watched.jsx` | `DELETE` | `/watched/remove/{movie_id}` | Bearer |

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
| Vite | 6 | Dev server, bundler; JSX handled by esbuild |
| React | 19 | UI |
| React Router | 7 | Client-side routing |
| Tailwind CSS | 4 | Utility CSS, via `@tailwindcss/vite` |
| ESLint | 9 | Flat config in `eslint.config.js`, with the React / hooks / refresh plugins |
| `lucide-react`, `react-icons` | — | Icons |
| `react-transition-group` | — | Transitions |

Config files: `vite.config.js`, `tailwind.config.js`, `postcss.config.cjs`,
`eslint.config.js`.

Styling is a mix of Tailwind utility classes and large inline `style={{…}}`
objects, plus a little hand-written CSS in `src/index.css` and `src/App.css`.

### Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Dev server with HMR on **http://localhost:5173** |
| `npm run build` | `vite build` | Production bundle into `dist/` |
| `npm run preview` | `vite preview` | Serve the built bundle locally |
| `npm run lint` | `eslint .` | Lint |

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
- **`axios` is imported by `Search.jsx` but is not in `package.json`.** It
  resolves today only if something else hoisted it into `node_modules`; a clean
  `npm install` will break that page. Either add the dependency or convert the
  call to `fetch` like every other call site.
- **The backend URL is hard-coded** as `http://127.0.0.1:8000` in ten places
  rather than read from `VITE_API_BASE_URL`, so the app cannot be pointed at a
  deployed backend without editing source.
- **`dist/` is committed** despite being listed in `.gitignore`; it was tracked
  before the ignore rule existed and the build output is stale.
- **`src/components/MovieDetails.jsx` is dead code** — superseded by
  `src/pages/MovieDetails.jsx`.
- **`src/pages/Account.jsx` is an unrouted placeholder.**
- **Tailwind v4 is installed but `src/index.css` uses the v3 directives**
  (`@tailwind base;` …) rather than v4's `@import "tailwindcss"`. Tailwind is
  also configured twice, through `@tailwindcss/vite` in `vite.config.js` *and*
  `@tailwindcss/postcss` in `postcss.config.cjs`.
- **`vite.config.js` does not register `@vitejs/plugin-react`** even though it
  is a devDependency, so JSX is transformed by esbuild without React Fast
  Refresh.
- **`PrivateRoute` only checks that a token string exists**, never that it is
  valid or unexpired.
- **No tests and no CI workflow** in this repository yet.

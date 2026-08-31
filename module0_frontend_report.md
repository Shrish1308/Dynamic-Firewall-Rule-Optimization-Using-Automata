# Module 0 — Frontend Foundation: Complete Report

## What Was Built

### Stack
| Tool | Version | Purpose |
|---|---|---|
| Vite | 8.x | Build tool / dev server |
| React | 19.x | UI framework |
| React Router DOM | 7.x | Client-side routing |
| Lucide React | latest | Icon set |
| Vanilla CSS | — | All styling (no Tailwind, no UI libraries) |

---

## File Tree Created

```
frontend/
├── index.html                   ← SEO title, Inter + JetBrains Mono fonts
├── vite.config.js               ← Vite default config
├── package.json
└── src/
    ├── main.jsx                 ← React entry point
    ├── index.css                ← Full design system (tokens, reset, layout, all component classes)
    ├── App.jsx                  ← BrowserRouter + 6 Routes
    │
    ├── data/
    │   └── mockData.js          ← All mock data (aligned to frozen contract)
    │
    ├── services/
    │   └── api.js               ← Centralized API service (mock now, swap later)
    │
    ├── components/
    │   ├── Sidebar.jsx          ← Navigation sidebar with active-link highlighting
    │   ├── Badge.jsx            ← Badge, ActionBadge, ProtocolBadge, IssueBadge
    │   ├── Button.jsx           ← Button (primary/secondary/danger/ghost variants)
    │   ├── Card.jsx             ← Card + StatCard
    │   ├── Modal.jsx            ← Modal + ConfirmModal (Escape-key + backdrop close)
    │   └── Table.jsx            ← Generic column-config-driven Table
    │
    └── pages/
        ├── Dashboard.jsx        ← Hero banner, stat cards, quick actions, issue list
        ├── Rules.jsx            ← Full CRUD (add/edit modal, delete confirm, validation)
        ├── Analysis.jsx         ← Stat cards + color-coded issue list
        ├── Automata.jsx         ← Rule selector + SVG DFA graph + transition table
        ├── Simulator.jsx        ← Packet form + rule trace + automaton path
        └── Optimization.jsx     ← Metrics + recommendations + optimized rule table
```

---

## Design System (`index.css`)

All styling is CSS custom properties — no UI library dependency.

| Category | Tokens |
|---|---|
| Surfaces | `--clr-bg`, `--clr-surface`, `--clr-surface-2` |
| Brand | `--clr-accent` (blue), `--clr-accent-2` (purple) |
| Status | `--clr-success`, `--clr-warning`, `--clr-danger`, `--clr-info` |
| Fonts | `--font-sans` (Inter), `--font-mono` (JetBrains Mono) |
| Spacing | `--radius-sm` through `--radius-xl`, `--shadow` through `--shadow-lg` |

Pre-built classes: `.btn`, `.badge`, `.card`, `.table-wrap`, `.form-control`, `.modal`, `.sidebar`, `.nav-item`, `.hero-banner`, `.stat-grid`, `.empty-state`, `.chip`, `.animate-pulse`.

---

## Mock Data Contract (`src/data/mockData.js`)

Uses **exactly** the frozen Module 0 field names. No camelCase invented.

```js
// Rule shape
{ id, priority, source, destination, protocol, source_port, destination_port, action }

// Packet shape
{ source, destination, protocol, source_port, destination_port }
```

8 rules loaded — intentionally including:
- **R1 vs R5** — conflict (same traffic, ALLOW vs DENY) + R5 is shadowed by R1
- **R7** — catch-all DENY (`ANY 0.0.0.0/0 → 0.0.0.0/0`)
- **R8** — unreachable because R7 blocks all traffic above it

This gives full demo coverage for every analysis type from day one.

---

## API Service (`src/services/api.js`)

| Function | Future endpoint | Current state |
|---|---|---|
| `getRules()` | `GET /rules` | Returns mock |
| `createRule(rule)` | `POST /rules` | Mock creates |
| `updateRule(id, rule)` | `PUT /rules/{id}` | Mock updates |
| `deleteRule(id)` | `DELETE /rules/{id}` | Mock deletes |
| `validateRules(rules)` | `POST /validate` | Mock validates |
| `getAnalysis()` | `GET /analysis` | Returns mock analysis |
| `getAutomaton(ruleId)` | `GET /automata/{rule_id}` | Returns mock DFA |
| `simulatePacket(packet)` | `POST /simulate` | Returns mock trace |
| `optimizeRules(rules)` | `POST /optimize` | Returns mock result |

To connect real backend: replace each function body in `api.js` with a `fetch()` call. **No component code needs to change.**

---

## Pages Summary

| Page | Route | What it does |
|---|---|---|
| Dashboard | `/` | Hero, 4 stat cards, quick-action links, recent issue list |
| Rules | `/rules` | CRUD table — add/edit modal with validation, delete confirm dialog |
| Analysis | `/analysis` | Stats + expandable color-coded issue cards |
| Automata | `/automata` | Rule selector + SVG DFA state machine + transition table |
| Simulator | `/simulator` | Packet form → rule trace → final verdict → automaton path |
| Optimization | `/optimize` | Run optimizer → metrics → safe/review recommendations → table |

---

## What Is NOT Done (intentionally)

- No real backend calls — all API functions return mock data
- No backend files touched
- No real DFA layout algorithm (placeholder SVG — Module 5 scope)
- No real analysis engine (mock data covers all cases — Module 6 scope)
- No auth, no persistence

---

## How to Run the App

Open a terminal, then:

```powershell
cd "d:\5th Semester\TOC\Dynamic-Firewall-Rule-Optimization-Using-Automata\frontend"
npm run dev
```

Open **http://localhost:5173** in your browser.

The dev server **hot-reloads** on every file save — you do not need to restart it when editing code.

**Stop the server:** `Ctrl + C`

---

## Backend Integration Checklist (Module 9)

When your teammate finishes the FastAPI layer:

1. Create `frontend/.env.local`:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```
2. Open `src/services/api.js`
3. Replace each mock function body with a real `fetch()` call, in this order:
   - Rules CRUD → Validation → Analysis → Automata → Simulation → Optimization
4. Zero component files need to change.

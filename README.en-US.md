<h1 align="center">ZL WMS</h1>

<p align="center">Integrated Warehouse Management Platform · Web Frontend</p>

<p align="center">
  <img src="https://img.shields.io/badge/vue-3.5-42b883" alt="vue">
  <img src="https://img.shields.io/badge/vite-7-646cff" alt="vite">
  <img src="https://img.shields.io/badge/element--plus-2.11-409eff" alt="element-plus">
  <img src="https://img.shields.io/badge/typescript-5.9-3178c6" alt="typescript">
  <img src="https://img.shields.io/github/license/pure-admin/vue-pure-admin.svg" alt="license">
</p>

**English** | [中文](./README.md)

## Introduction

ZL WMS (智联仓储 WMS) is the web frontend of an integrated warehouse management platform for 3PL and bonded-warehouse scenarios. It covers the full warehouse workflow — **inbound → outbound → inventory → in-warehouse operations → transportation → billing** — and extends into customs declaration integration and AI agent collaboration for bonded / cross-border business.

The frontend is built on top of the [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) lite edition (i18n version), with Chinese/English bilingual support (vue-i18n), a navy + signal-cyan brand visual system, and light/dark themes. All page copy is managed via `src/locales/*.yaml` — hardcoding text in pages is not allowed.

## Modules

| Module | Pages |
| --- | --- |
| Master Data | Warehouse, Zone, Location, Material, Owner, Supplier, Customer, Container |
| Inbound | Appointment, Receiving, QC, Putaway, Return Inbound |
| Outbound | Order, Wave, Picking, Packing, Shipping |
| Inventory | Ledger, Serial Number, Batch & Expiry, Move, Adjustment, Stocktake, Warning, Transaction |
| In-Warehouse Ops | Task Pool, Replenishment, Processing, Cross-docking |
| Transportation | Carrier, Vehicle & Driver, Dispatch, In-transit Tracking |
| Billing | Billing Rules, Bills, Reconciliation |
| Customs | Ledger Account, Verify List, Release Order, Triple Matching, Customs Message Log |
| Reports | Inventory Dashboard, In/Out Reports, Efficiency, Data Screen |
| Devices & Integration | Device, AGV Scheduling, Device Task, Integration Config, API Log |
| AI Agent Center | Agent Workflow, Run Records |
| System | User, Role, Menu, Organization, Dictionary, Parameter, Operation Log, Notification |

## AI Agent

- The frontend ships a **Copilot chat entry + visual workflow management + run records** suite;
- It only agrees on a **unified SSE event-stream contract** with the backend orchestration engine, and is not bound to any specific engine;
- When `AiEndpoint` in `public/platform-config.json` is empty, the built-in **Local Preview Engine** takes over automatically for demos and joint debugging; once a backend engine (LangGraph / Dify / n8n, etc.) is connected, the frontend requires zero changes;
- See `docs/智能体工作流需求说明.md` (Chinese) for details.

## Tech Stack

Vue 3 · Vite 7 · TypeScript · Element Plus · Pinia · Vue Router · Tailwind CSS 4 · ECharts 6 · vue-i18n · @pureadmin/table · vite-plugin-fake-server

## Getting Started

> Requirements: Node.js `^20.19.0 || >=22.13.0`, pnpm `>=9`

```bash
pnpm install
pnpm dev          # Dev server, default http://localhost:8848
pnpm build        # Production build
pnpm typecheck    # Type check
pnpm lint         # eslint + prettier + stylelint
```

## Mock vs. Real Backend

- With `VITE_USE_MOCK = true` in `.env`, all requests are served by the local mock (vite-plugin-fake-server);
- Once the backend is ready, set it to `false` and configure `VITE_PROXY` in `.env.development` for a seamless switch;
- API contracts and integration rules are documented in `docs/后端API对接指南.md` (Chinese).

## Project Structure

```
├── mock                        # Local mock API (vite-plugin-fake-server)
├── public
│   └── platform-config.json    # Runtime platform config (title, AI switch, etc.)
├── src
│   ├── api                     # API layer, split by business domain
│   ├── constants               # Dictionaries & constants (wms.ts)
│   ├── locales                 # i18n copy (zh-CN.yaml / en.yaml)
│   ├── router/modules          # Route modules, split by business domain
│   ├── style/wms-theme.scss    # Global brand skin & dark-mode tokens
│   └── views                   # Pages (pure-admin trio: index.vue + form.vue + utils/hook.tsx)
├── docs                        # Requirements & integration docs (Chinese)
├── build                       # Vite plugin configs
└── CONVENTIONS.md              # Frontend conventions (Chinese)
```

## Documentation

- [Frontend Conventions](./CONVENTIONS.md)
- [UI Design Spec](./docs/UI设计规范.md)
- [Backend API Guide](./docs/后端API对接指南.md)
- [Customs Module Requirements](./docs/海关对接模块需求文档.md)
- [AI Agent Workflow Requirements](./docs/智能体工作流需求说明.md)

## Acknowledgements

This project is built on the lite edition of [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin). Thanks to the [pure-admin team](https://github.com/pure-admin) for the great foundation and [documentation](https://pure-admin.cn/).

## License

[MIT © 2020-present, pure-admin](./LICENSE)

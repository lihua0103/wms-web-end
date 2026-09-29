<h1 align="center">智联仓储 WMS</h1>

<p align="center">一体化仓储管理平台 · Web 前端</p>

<p align="center">
  <img src="https://img.shields.io/badge/vue-3.5-42b883" alt="vue">
  <img src="https://img.shields.io/badge/vite-7-646cff" alt="vite">
  <img src="https://img.shields.io/badge/element--plus-2.11-409eff" alt="element-plus">
  <img src="https://img.shields.io/badge/typescript-5.9-3178c6" alt="typescript">
  <img src="https://img.shields.io/github/license/pure-admin/vue-pure-admin.svg" alt="license">
</p>

**中文** | [English](./README.en-US.md)

## 系统介绍

智联仓储 WMS 是一套面向第三方物流与保税仓场景的一体化仓储管理平台前端，覆盖 **入库 → 出库 → 库存 → 库内作业 → 运输 → 计费** 的仓储作业全流程，并延伸至保税 / 跨境业务所需的海关申报对接与 AI 智能体协同。

前端基于 [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) 精简版（国际化版）二次开发，采用中英双语（vue-i18n）、藏青 + 信号青品牌视觉体系，支持亮 / 暗双主题。所有页面文案禁止硬编码，一律走 `src/locales/*.yaml`。

## 功能模块

| 模块 | 页面 |
| --- | --- |
| 主数据 | 仓库、库区、库位、物料、货主、供应商、客户、容器 |
| 入库管理 | 入库预约、收货、质检、上架任务、退货入库 |
| 出库管理 | 出库单、波次、拣货任务、复核打包、发货交接 |
| 库存管理 | 库存台账、序列号、批次效期、移库、库存调整、盘点、库存预警、库存流水 |
| 库内作业 | 任务池、补货、加工、越库作业 |
| 运输管理 | 承运商、车辆司机、配送单、在途跟踪 |
| 计费结算 | 计费规则、费用账单、对账单 |
| 海关对接 | 账册管理、核注清单、核放单、三单对碰、海关报文 |
| 报表分析 | 库存看板、出入库报表、作业效率、数据大屏 |
| 设备与集成 | 设备管理、AGV 调度、设备任务、集成配置、接口日志 |
| 智能体中心 | 智能体工作流、运行记录 |
| 系统管理 | 用户、角色、菜单、组织架构、数据字典、系统参数、操作日志、消息通知 |

## 智能体（AI Agent）

- 前端提供 **Copilot 对话入口 + 可视化工作流管理 + 运行记录** 三件套；
- 与后端编排引擎之间只约定 **统一的 SSE 事件流契约**，前端不绑定任何引擎；
- `public/platform-config.json` 中 `AiEndpoint` 为空时自动降级为内置 **本地预览引擎（Local Preview Engine）**，支撑演示与联调；后端接入 LangGraph / Dify / n8n 等引擎后前端零改动；
- 详见 `docs/智能体工作流需求说明.md`。

## 技术栈

Vue 3 · Vite 7 · TypeScript · Element Plus · Pinia · Vue Router · Tailwind CSS 4 · ECharts 6 · vue-i18n · @pureadmin/table · vite-plugin-fake-server

## 快速开始

> 环境要求：Node.js `^20.19.0 || >=22.13.0`，pnpm `>=9`

```bash
pnpm install
pnpm dev          # 开发环境，默认 http://localhost:8848
pnpm build        # 生产构建
pnpm typecheck    # 类型检查
pnpm lint         # eslint + prettier + stylelint
```

## Mock 与真实后端切换

- `.env` 中 `VITE_USE_MOCK = true` 时全部接口走本地 mock（vite-plugin-fake-server）；
- 后端就绪后改为 `false`，并在 `.env.development` 配置 `VITE_PROXY` 即可无缝切换；
- 接口契约与对接规范见 `docs/后端API对接指南.md`。

## 目录结构

```
├── mock                        # 本地 mock 接口（vite-plugin-fake-server）
├── public
│   └── platform-config.json    # 平台运行时配置（标题、AI 开关等）
├── src
│   ├── api                     # 按业务域划分的接口层
│   ├── constants               # 字典与常量（wms.ts）
│   ├── locales                 # 国际化文案（zh-CN.yaml / en.yaml）
│   ├── router/modules          # 按业务域划分的路由模块
│   ├── style/wms-theme.scss    # 全局品牌皮肤与暗色模式令牌
│   └── views                   # 页面（pure-admin 三件套：index.vue + form.vue + utils/hook.tsx）
├── docs                        # 需求与对接文档
├── build                       # vite 构建插件配置
└── CONVENTIONS.md              # 前端开发规范
```

## 项目文档

- [前端开发规范](./CONVENTIONS.md)
- [UI 设计规范](./docs/UI设计规范.md)
- [后端 API 对接指南](./docs/后端API对接指南.md)
- [海关对接模块需求文档](./docs/海关对接模块需求文档.md)
- [智能体工作流需求说明](./docs/智能体工作流需求说明.md)

## 致谢

本项目基于 [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) 精简版二次开发，感谢 [pure-admin 团队](https://github.com/pure-admin) 提供的优秀底座与 [文档](https://pure-admin.cn/)。

## 许可证

[MIT © 2020-present, pure-admin](./LICENSE)

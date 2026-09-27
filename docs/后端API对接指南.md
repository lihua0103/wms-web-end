# 后端 API 对接指南（Mock → 真实后端一键切换）

> 本前端项目所有功能均先以 mock 数据实现，同时预留了完整的 API 层。
> 后端按本文约定实现接口后，**前端代码零改动**，只需切换一个环境变量。

## 一、切换步骤（共 2 步）

### 1. 关闭 mock

`.env` 中：

```ini
VITE_USE_MOCK = false   # true=本地 mock；false=直连后端
```

### 2. 配置后端代理

`.env.development`（或 `.env.production`）中添加代理前缀，然后在 `vite.config.ts` 的 `server.proxy` 增加映射：

```ini
# .env.development
VITE_PROXY = /api:http://localhost:8080
```

> 若后端接口路径不含 `/api` 前缀，请在代理配置中做 rewrite，或直接让后端兼容 `/wms/**` 路径。

完成。所有接口将直接打到后端，mock 不再拦截。

## 二、全局接口约定

| 项目 | 约定 |
|---|---|
| 基础路径 | `/wms/**` |
| 认证 | `Authorization: Bearer <accessToken>`（登录接口返回，见下方"认证接口"） |
| 响应结构 | `{ "success": true, "code": 0, "msg": "ok", "data": ... }`；code=0 且 success=true 为成功 |
| 分页请求 | GET `?page=1&pageSize=20&keyword=&其他过滤字段=` |
| 分页响应 | `data: { "list": [...], "total": 123 }` |
| 批量删除 | POST body `{ "ids": [1,2,3] }` |
| 时间格式 | `yyyy-MM-dd HH:mm:ss` |

### 标准资源端点（所有实体通用）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/wms/{模块}/{实体}/page` | 分页 + 过滤（keyword 按 searchFields 模糊匹配） |
| GET | `/wms/{模块}/{实体}/list` | 全量（同样支持过滤） |
| GET | `/wms/{模块}/{实体}/detail?id=` | 详情 |
| POST | `/wms/{模块}/{实体}/add` | 新增（body 为实体字段） |
| POST | `/wms/{模块}/{实体}/update` | 更新（body 含 id） |
| POST | `/wms/{模块}/{实体}/delete` | 删除（body 含 ids 数组） |

### 认证接口（沿用 pure-admin 原生约定，未改动）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/login` | 登录，返回 `{ success, data: { avatar, username, nickname, roles, permissions, accessToken, refreshToken, expires } }` |
| POST | `/refresh-token` | 刷新 token |
| GET | `/get-async-routes` | 动态路由（当前返回空数组，菜单走前端本地路由） |

## 三、各模块接口清单（与 src/api/*.ts 一一对应）

> 前端 API 层定义在 `src/api/`，mock 实现在 `mock/`。后端实现时对照同路径实现即可。
> 实体字段以 `src/api/<模块>.ts` 中的 TypeScript interface 为准（即后端返回 JSON 需包含这些字段）。

### 系统管理（src/api/system.ts，mock/system.ts）

- 用户 `/wms/system/user`：page/list/detail/add/update/delete + POST `/reset-pwd`
- 角色 `/wms/system/role`：标准 CRUD + GET `/menus?id=`、POST `/save-menus`（body: `{id, menuIds}`）
- 菜单 `/wms/system/menu`：GET `/tree`、add/update/delete
- 组织 `/wms/system/org`：GET `/tree`、add/update/delete
- 字典 `/wms/system/dict`：标准 CRUD；字典数据 `/wms/system/dict-data`：GET `/list?dictCode=`、add/update/delete
- 参数 `/wms/system/param`：标准 CRUD
- 日志 `/wms/system/log`：page
- 通知 `/wms/system/notice`：page/add + POST `/read`（body: ids）、delete

### 工作台（GET `/wms/dashboard/stats`）

返回结构见 `DashboardStats`（今日出入库单量、SKU 总数、库存总量、待办任务、预警数、近 7 天趋势、各仓库存占比、待办事项列表）。

### 主数据（src/api/master.ts）

- 仓库 `/wms/master/warehouse`、库区 `/wms/master/zone`、库位 `/wms/master/location`、物料 `/wms/master/material`、货主 `/wms/master/owner`、供应商 `/wms/master/supplier`、客户 `/wms/master/customer`、容器 `/wms/master/container`：均标准 CRUD
- 库位批量生成：POST `/wms/master/location/generate`，body `{warehouseCode, zoneCode, prefix, row, col, floor}`，返回生成的数量

### 入库管理（src/api/inbound.ts）

- 预约 `/wms/inbound/asn`：标准 CRUD + POST `/approve` `{id, pass}`
- 收货 `/wms/inbound/receipt`：标准 CRUD + POST `/audit` `{id}`、POST `/register` `{id, receivedQty, qualifiedQty, rejectedQty}`
- 质检 `/wms/inbound/qc`：标准 CRUD + POST `/submit` `{id, qcResult, qcRemark}`
- 上架 `/wms/inbound/putaway`：标准 CRUD + POST `/finish` `{id}`
- 退货 `/wms/inbound/return`：标准 CRUD + POST `/approve` `{id, pass}`

### 出库管理（src/api/outbound.ts）

- 出库单 `/wms/outbound/order`：标准 CRUD + POST `/approve` `{id, pass}`
- 波次 `/wms/outbound/wave`：标准 CRUD + POST `/generate` `{warehouseCode, carrierName}`（返回新波次）、POST `/release` `{id}`
- 拣货 `/wms/outbound/picking`：标准 CRUD + POST `/start` `{id}`、POST `/finish` `{id}`
- 复核 `/wms/outbound/packing`：标准 CRUD + POST `/check` `{id, checkedQty, weight}`
- 发货 `/wms/outbound/shipping`：标准 CRUD + POST `/confirm` `{id}`

### 库存管理（src/api/inventory.ts）

- 台账 `/wms/inventory/ledger`：标准 CRUD + POST `/freeze` `{ids, freeze}`
- 序列号 `/wms/inventory/serial`：标准 CRUD + POST `/scrap` `{ids, reason}`
- 批次 `/wms/inventory/batch`：page
- 移库 `/wms/inventory/move`：标准 CRUD + POST `/execute` `{id}`、POST `/cancel` `{id}`
- 调整 `/wms/inventory/adjustment`：标准 CRUD + POST `/approve` `{id, pass}`
- 盘点 `/wms/inventory/stocktake`：标准 CRUD + POST `/start`、`/submit-diff`、`/finish`、`/cancel`（均 `{id}`）；GET `/detail-items?stocktakeId=&page=&pageSize=`；POST `/save-actual` `{detailId, actualQty}`
- 预警 `/wms/inventory/warning`：page + POST `/handle` `{id, remark}`
- 流水 `/wms/inventory/transaction`：page

### 库内作业（src/api/operation.ts）

- 任务 `/wms/operation/task`：page + POST `/assign` `{id, assignee}`、`/cancel` `{id}`
- 补货 `/wms/operation/replenish`：标准 CRUD + POST `/finish` `{id}`
- 加工 `/wms/operation/process`：标准 CRUD + POST `/start` `{id}`、`/finish` `{id, outputQty}`
- 越库 `/wms/operation/crossdock`：page + POST `/execute` `{id}`

### 运输管理（src/api/transport.ts）

- 承运商 `/wms/transport/carrier`、车辆 `/wms/transport/vehicle`：标准 CRUD
- 配送 `/wms/transport/dispatch`：标准 CRUD + POST `/assign` `{id, carrierName, vehicleNo, driverName}`、`/sign` `{id}`
- 在途 `/wms/transport/tracking`：page

### 计费结算（src/api/billing.ts）

- 规则 `/wms/billing/rule`：标准 CRUD
- 账单 `/wms/billing/bill`：标准 CRUD + POST `/confirm`、`/invoice`、`/settle`（均 `{id}`）
- 对账 `/wms/billing/reconcile`：标准 CRUD + POST `/confirm`、`/dispute`（均 `{id}`）

### 报表分析（src/api/report.ts）

- GET `/wms/report/dashboard`（库存看板统计）
- GET `/wms/report/inout`（出入库报表，参数 dateRange/warehouseCode）
- GET `/wms/report/efficiency`（作业效率）
- GET `/wms/report/screen`（数据大屏）

### 设备与集成（src/api/integration.ts）

- 设备 `/wms/integration/device`：标准 CRUD + POST `/toggle` `{id, enable}`
- AGV `/wms/integration/agv`：page + POST `/dispatch`、`/retry`
- 设备任务 `/wms/integration/devicetask`：page + POST `/cancel` `{id}`
- 集成配置 `/wms/integration/config`：标准 CRUD + POST `/test` `{id}`
- 接口日志 `/wms/integration/apilog`：page

### 海关对接（src/api/customs.ts，mock/customs.ts）

- 账册 `/wms/customs/ledger`：标准 CRUD（行内含料号底账数组 `goods`）
- 核注清单 `/wms/customs/verifylist`：page/detail + POST `/declare` `{id}`（草稿/退单 → 已申报）、`/sync-receipt` `{id}`（已申报 → 审核通过 → 已核扣）
- 核放单 `/wms/customs/release`：page/detail + POST `/declare`、`/release`、`/cross`、`/cancel`（均 `{id}`；状态机 待申报 → 已申报 → 已放行 → 已过卡）
- 三单 `/wms/customs/tripledoc`：page/detail + POST `/push` `{id}`（待推送/对碰失败 → 推送并返回对碰结果）
- 报文 `/wms/customs/msglog`：page/detail + POST `/resend` `{id}`（失败报文重发）
- 字段结构以 `src/api/customs.ts` 的 interface 为准；字典枚举见 `src/constants/wms.ts` 海关对接段落（监管方式、核注清单/核放单/三单状态、申报通道等）

## 四、字典枚举对照

所有枚举值（单据状态、库区类型、库存状态、任务类型、设备类型等）以
`src/constants/wms.ts` 为唯一口径，后端存储与返回请使用相同的 value（英文枚举），前端负责渲染中文标签。

## 五、验证清单

切换后建议逐页冒烟：登录 → 工作台 → 主数据 8 页 → 入库 5 页 → 出库 5 页 → 库存 8 页 → 库内 4 页 → 运输 4 页 → 计费 3 页 → 报表 4 页 → 设备集成 5 页 → 海关对接 5 页（共 59 页），确认列表加载、新增/编辑、状态流转按钮可用。

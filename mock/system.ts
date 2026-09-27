import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  ok,
  crudRoutes,
  genRows,
  pick,
  randInt,
  pickDate,
  offsetStr,
  nowStr
} from "./_db";

// ========================= 种子数据 =========================

const warehouses = ["WH001 上海主仓", "WH002 广州华南仓", "WH003 成都西南仓"];
const depts = ["仓储运营部", "运输配送部", "IT 信息部", "财务部", "质量管理部"];

const users = genRows(28, i => ({
  id: i,
  username: i === 1 ? "admin" : `user${String(i).padStart(3, "0")}`,
  nickname:
    i === 1
      ? "系统管理员"
      : pick(["张伟", "王芳", "李娜", "刘洋", "陈静", "杨帆"]) + i,
  phone: `13${randInt(0, 9)}${String(randInt(10000000, 99999999))}`,
  email: `user${i}@wms.com`,
  dept: pick(depts),
  warehouseCodes: [pick(warehouses).slice(0, 5)],
  roles: [pick(["admin", "warehouse_op", "inventory_mgr", "transport_mgr"])],
  status: Math.random() > 0.15 ? 1 : 0,
  remark: "",
  createdAt: pickDate(180, 1)
}));

const roles = [
  {
    id: 1,
    code: "admin",
    name: "超级管理员",
    description: "拥有系统全部权限",
    status: 1,
    memberCount: 2,
    createdAt: "2025-01-01 09:00:00"
  },
  {
    id: 2,
    code: "warehouse_op",
    name: "仓库操作员",
    description: "入库/出库/库内作业",
    status: 1,
    memberCount: 12,
    createdAt: "2025-01-05 09:00:00"
  },
  {
    id: 3,
    code: "inventory_mgr",
    name: "库存管理员",
    description: "库存/盘点/调整",
    status: 1,
    memberCount: 5,
    createdAt: "2025-02-11 09:00:00"
  },
  {
    id: 4,
    code: "transport_mgr",
    name: "运输调度员",
    description: "配送/装车/在途",
    status: 1,
    memberCount: 4,
    createdAt: "2025-03-02 09:00:00"
  },
  {
    id: 5,
    code: "billing_mgr",
    name: "计费专员",
    description: "计费规则/账单对账",
    status: 1,
    memberCount: 2,
    createdAt: "2025-04-18 09:00:00"
  },
  {
    id: 6,
    code: "qc_inspector",
    name: "质检员",
    description: "入库质检/不合格处理",
    status: 1,
    memberCount: 3,
    createdAt: "2025-05-06 09:00:00"
  },
  {
    id: 7,
    code: "viewer",
    name: "只读查看",
    description: "仅查看报表",
    status: 0,
    memberCount: 1,
    createdAt: "2025-06-20 09:00:00"
  }
];

const dictTypes = [
  {
    id: 1,
    name: "单据状态",
    code: "doc_status",
    remark: "通用单据状态",
    itemCount: 6,
    createdAt: "2025-01-01 09:00:00"
  },
  {
    id: 2,
    name: "入库单类型",
    code: "inbound_type",
    remark: "",
    itemCount: 5,
    createdAt: "2025-01-01 09:00:00"
  },
  {
    id: 3,
    name: "出库单类型",
    code: "outbound_type",
    remark: "",
    itemCount: 5,
    createdAt: "2025-01-01 09:00:00"
  },
  {
    id: 4,
    name: "库存状态",
    code: "stock_status",
    remark: "",
    itemCount: 4,
    createdAt: "2025-01-01 09:00:00"
  },
  {
    id: 5,
    name: "库区类型",
    code: "zone_type",
    remark: "",
    itemCount: 8,
    createdAt: "2025-01-01 09:00:00"
  },
  {
    id: 6,
    name: "任务类型",
    code: "task_type",
    remark: "作业任务类型",
    itemCount: 8,
    createdAt: "2025-01-01 09:00:00"
  },
  {
    id: 7,
    name: "设备类型",
    code: "device_type",
    remark: "自动化设备",
    itemCount: 6,
    createdAt: "2025-01-01 09:00:00"
  },
  {
    id: 8,
    name: "费用类型",
    code: "fee_type",
    remark: "计费结算",
    itemCount: 5,
    createdAt: "2025-01-01 09:00:00"
  }
];

const dictData = [
  {
    id: 1,
    dictCode: "doc_status",
    label: "草稿",
    value: "draft",
    sort: 1,
    status: 1
  },
  {
    id: 2,
    dictCode: "doc_status",
    label: "待审核",
    value: "pending",
    sort: 2,
    status: 1
  },
  {
    id: 3,
    dictCode: "doc_status",
    label: "执行中",
    value: "processing",
    sort: 3,
    status: 1
  },
  {
    id: 4,
    dictCode: "doc_status",
    label: "已完成",
    value: "finished",
    sort: 4,
    status: 1
  },
  {
    id: 5,
    dictCode: "doc_status",
    label: "已取消",
    value: "cancelled",
    sort: 5,
    status: 1
  },
  {
    id: 6,
    dictCode: "doc_status",
    label: "已审核",
    value: "approved",
    sort: 6,
    status: 1
  }
];

const params = [
  {
    id: 1,
    name: "出库批次策略",
    key: "outbound.batch.strategy",
    value: "FEFO",
    builtIn: 1,
    remark: "FEFO先到期先出/FIFO先进先出",
    updatedAt: offsetStr(-10)
  },
  {
    id: 2,
    name: "默认上架策略",
    key: "putaway.strategy",
    value: "就近空库位",
    builtIn: 1,
    remark: "",
    updatedAt: offsetStr(-15)
  },
  {
    id: 3,
    name: "安全库存预警开关",
    key: "warning.safety.enabled",
    value: "true",
    builtIn: 0,
    remark: "",
    updatedAt: offsetStr(-20)
  },
  {
    id: 4,
    name: "临期预警天数",
    key: "warning.expiring.days",
    value: "30",
    builtIn: 1,
    remark: "距失效期天数",
    updatedAt: offsetStr(-25)
  },
  {
    id: 5,
    name: "呆滞库存天数",
    key: "warning.dead.days",
    value: "90",
    builtIn: 1,
    remark: "无动碰天数",
    updatedAt: offsetStr(-30)
  },
  {
    id: 6,
    name: "波次合单规则",
    key: "wave.merge.rule",
    value: "按承运商+线路",
    builtIn: 0,
    remark: "",
    updatedAt: offsetStr(-8)
  },
  {
    id: 7,
    name: "AGV 任务下发模式",
    key: "agv.dispatch.mode",
    value: "自动",
    builtIn: 0,
    remark: "自动/人工确认",
    updatedAt: offsetStr(-5)
  },
  {
    id: 8,
    name: "计费周期",
    key: "billing.cycle",
    value: "月结",
    builtIn: 0,
    remark: "",
    updatedAt: offsetStr(-12)
  }
];

const logModules = [
  "用户管理",
  "入库管理",
  "出库管理",
  "库存管理",
  "盘点",
  "设备集成"
];
const logs = genRows(60, i => ({
  id: i,
  username: pick(["admin", "user002", "user003", "user005"]),
  module: pick(logModules),
  action: pick(["新增", "修改", "删除", "审核", "导出", "登录"]),
  ip: `192.168.1.${randInt(2, 254)}`,
  status: Math.random() > 0.1 ? 1 : 0,
  duration: randInt(20, 800),
  createdAt:
    pickDate(30, 0) +
    " " +
    `${String(randInt(8, 20)).padStart(2, "0")}:${String(randInt(0, 59)).padStart(2, "0")}:00`
}));

const notices = genRows(12, i => ({
  id: i,
  title: pick([
    "系统升级通知",
    "双节发货高峰提醒",
    "库存盘点计划",
    "新仓库上线公告",
    "AGV 维护保养通知",
    "计费规则调整公告"
  ]),
  type: pick(["notice", "announce", "warning"]),
  level: pick(["high", "normal", "low"]),
  content: "请相关部门知悉并配合执行。",
  status: Math.random() > 0.5 ? 1 : 0,
  publisher: "admin",
  createdAt: pickDate(15, 0) + " 10:00:00"
}));

// 菜单树（演示用，实际菜单由前端本地路由渲染）
const menuTree = [
  {
    id: 1,
    parentId: null,
    menuType: "dir",
    name: "系统管理",
    path: "/system",
    icon: "ep/setting",
    sort: 1,
    status: 1,
    label: "系统管理",
    children: [
      {
        id: 11,
        parentId: 1,
        menuType: "menu",
        name: "用户管理",
        path: "/system/user",
        sort: 1,
        status: 1,
        label: "用户管理",
        children: [
          {
            id: 111,
            parentId: 11,
            menuType: "button",
            name: "新增用户",
            permission: "system:user:add",
            sort: 1,
            status: 1,
            label: "新增用户"
          }
        ]
      },
      {
        id: 12,
        parentId: 1,
        menuType: "menu",
        name: "角色管理",
        path: "/system/role",
        sort: 2,
        status: 1,
        label: "角色管理"
      }
    ]
  },
  {
    id: 2,
    parentId: null,
    menuType: "dir",
    name: "库存管理",
    path: "/inventory",
    icon: "ep/box",
    sort: 2,
    status: 1,
    label: "库存管理",
    children: [
      {
        id: 21,
        parentId: 2,
        menuType: "menu",
        name: "库存台账",
        path: "/inventory/ledger",
        sort: 1,
        status: 1,
        label: "库存台账"
      },
      {
        id: 22,
        parentId: 2,
        menuType: "menu",
        name: "盘点管理",
        path: "/inventory/stocktake",
        sort: 2,
        status: 1,
        label: "盘点管理"
      }
    ]
  }
];

// 组织架构（公司-仓库-部门）
const orgTree = [
  {
    id: 1,
    parentId: null,
    type: "company",
    name: "智联物流集团",
    leader: "张伟",
    phone: "021-88888888",
    label: "智联物流集团",
    children: [
      {
        id: 11,
        parentId: 1,
        type: "warehouse",
        name: "WH001 上海主仓",
        leader: "李强",
        phone: "021-66666666",
        label: "WH001 上海主仓",
        children: [
          {
            id: 111,
            parentId: 11,
            type: "dept",
            name: "仓储运营部",
            leader: "王敏",
            phone: "021-66666601",
            label: "仓储运营部"
          },
          {
            id: 112,
            parentId: 11,
            type: "dept",
            name: "质量管理部",
            leader: "赵磊",
            phone: "021-66666602",
            label: "质量管理部"
          }
        ]
      },
      {
        id: 12,
        parentId: 1,
        type: "warehouse",
        name: "WH002 广州华南仓",
        leader: "陈涛",
        phone: "020-77777777",
        label: "WH002 广州华南仓",
        children: [
          {
            id: 121,
            parentId: 12,
            type: "dept",
            name: "仓储运营部",
            leader: "刘婷",
            phone: "020-77777701",
            label: "仓储运营部"
          }
        ]
      }
    ]
  }
];

// ========================= 路由 =========================

export default defineFakeRoute([
  ...crudRoutes({
    prefix: "/wms/system/user",
    seed: users,
    searchFields: ["username", "nickname", "phone"]
  }),
  ...crudRoutes({
    prefix: "/wms/system/role",
    seed: roles,
    searchFields: ["code", "name"]
  }),
  ...crudRoutes({
    prefix: "/wms/system/dict",
    seed: dictTypes,
    searchFields: ["name", "code"]
  }),
  ...crudRoutes({
    prefix: "/wms/system/param",
    seed: params,
    searchFields: ["name", "key"]
  }),
  ...crudRoutes({
    prefix: "/wms/system/log",
    seed: logs,
    searchFields: ["username", "module", "action"]
  }),
  ...crudRoutes({
    prefix: "/wms/system/notice",
    seed: notices,
    searchFields: ["title"]
  }),
  // 字典数据
  {
    url: "/wms/system/dict-data/list",
    method: "get",
    response: ({ query }) =>
      ok(dictData.filter(d => d.dictCode === query.dictCode))
  },
  {
    url: "/wms/system/dict-data/add",
    method: "post",
    response: ({ body }) => {
      const row = { id: Date.now(), ...(body as Record<string, unknown>) };
      dictData.push(row as any);
      return ok(row, "新增成功");
    }
  },
  {
    url: "/wms/system/dict-data/update",
    method: "post",
    response: ({ body }) => {
      const row = dictData.find(d => d.id === body.id);
      if (row) Object.assign(row, body);
      return ok(row, "更新成功");
    }
  },
  {
    url: "/wms/system/dict-data/delete",
    method: "post",
    response: ({ body }) => {
      const ids: number[] = body?.ids ?? [];
      for (const id of ids) {
        const idx = dictData.findIndex(d => d.id === id);
        if (idx > -1) dictData.splice(idx, 1);
      }
      return ok(true, "删除成功");
    }
  },
  // 菜单树
  { url: "/wms/system/menu/tree", method: "get", response: () => ok(menuTree) },
  {
    url: "/wms/system/menu/add",
    method: "post",
    response: () => ok(null, "演示环境暂不支持新增")
  },
  {
    url: "/wms/system/menu/update",
    method: "post",
    response: () => ok(null, "更新成功")
  },
  {
    url: "/wms/system/menu/delete",
    method: "post",
    response: () => ok(true, "删除成功")
  },
  // 组织架构
  { url: "/wms/system/org/tree", method: "get", response: () => ok(orgTree) },
  {
    url: "/wms/system/org/add",
    method: "post",
    response: () => ok(null, "演示环境暂不支持新增")
  },
  {
    url: "/wms/system/org/update",
    method: "post",
    response: () => ok(null, "更新成功")
  },
  {
    url: "/wms/system/org/delete",
    method: "post",
    response: () => ok(true, "删除成功")
  },
  // 角色菜单授权
  {
    url: "/wms/system/role/menus",
    method: "get",
    response: () => ok([1, 11, 12, 21, 22])
  },
  {
    url: "/wms/system/role/save-menus",
    method: "post",
    response: () => ok(true, "授权成功")
  },
  // 用户重置密码
  {
    url: "/wms/system/user/reset-pwd",
    method: "post",
    response: () => ok(true, "密码已重置为 123456")
  },
  // 工作台统计
  {
    url: "/wms/dashboard/stats",
    method: "get",
    response: () =>
      ok({
        todayInboundCount: randInt(40, 120),
        todayOutboundCount: randInt(80, 260),
        totalSku: 1286,
        stockQty: randInt(80000, 120000),
        pendingTaskCount: randInt(30, 90),
        warningCount: randInt(5, 20),
        deltas: { inbound: 12.5, outbound: 8.2, sku: 3.1, stock: -2.4 },
        trend: genRows(7, i => ({
          date: offsetStr(7 - i).slice(5, 10),
          inbound: randInt(200, 800),
          outbound: randInt(300, 1000)
        })),
        warehouseStock: [
          { name: "welcome.whShanghai", value: 45200 },
          { name: "welcome.whGuangzhou", value: 32800 },
          { name: "welcome.whChengdu", value: 21400 }
        ],
        todos: [
          {
            title: "welcome.todoAsn",
            count: randInt(3, 15),
            path: "/inbound/receipt"
          },
          {
            title: "welcome.todoSo",
            count: randInt(5, 25),
            path: "/outbound/order"
          },
          {
            title: "welcome.todoDiff",
            count: randInt(0, 8),
            path: "/inventory/stocktake"
          },
          {
            title: "welcome.todoAlert",
            count: randInt(5, 20),
            path: "/inventory/warning"
          }
        ]
      })
  },
  { url: "/wms/dashboard/ping", method: "get", response: () => ok(nowStr()) }
]);

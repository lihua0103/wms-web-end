import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  ok,
  fail,
  crudRoutes,
  genRows,
  pick,
  randInt,
  pickDate,
  genCode
} from "./_db";

// ========================= 种子数据 =========================

const warehouses = ["WH001", "WH002", "WH003"];
const locations = [
  "A-01-01",
  "A-01-02",
  "A-02-01",
  "B-03-02",
  "B-05-01",
  "C-01-03",
  "D-02-02",
  "C-02-01"
];
const users = ["user002", "user003", "user004", "user005"];

function mkMaterial(i: number) {
  const code = `SKU${String(((i - 1) % 40) + 1).padStart(5, "0")}`;
  return {
    materialCode: code,
    materialName:
      [
        "不锈钢轴承",
        "伺服电机",
        "控制主板",
        "线束组件",
        "铝合金外壳",
        "橡胶密封圈",
        "包装纸箱",
        "缓冲泡沫",
        "标签贴纸",
        "螺丝套件"
      ][(i - 1) % 10] + `-${((i - 1) % 40) + 1}`
  };
}

const tasks = genRows(60, i => ({
  id: i,
  taskNo: genCode("TK", i),
  taskType: pick([
    "receive",
    "qc",
    "putaway",
    "replenish",
    "picking",
    "review",
    "move",
    "stocktake"
  ]),
  bizNo: genCode(pick(["IN", "OUT", "MV", "PD"]), i),
  warehouseCode: pick(warehouses),
  locationCode: pick(locations),
  ...mkMaterial(i),
  qty: randInt(10, 500),
  status: pick([
    "pending",
    "processing",
    "finished",
    "finished",
    "cancelled",
    "error"
  ]),
  assignee: pick(users),
  createdAt: pickDate(15, 0) + " 08:30:00"
}));

const replenishes = genRows(30, i => ({
  id: i,
  code: genCode("RP", i),
  warehouseCode: pick(warehouses),
  fromLocation: "B-0" + randInt(1, 5) + "-01",
  toLocation: "C-0" + randInt(1, 3) + "-0" + randInt(1, 5),
  ...mkMaterial(i),
  qty: randInt(20, 200),
  trigger: pick(["auto", "manual"]),
  status: pick(["pending", "processing", "finished", "finished", "cancelled"]),
  createdAt: pickDate(15, 0) + " 07:50:00"
}));

const processes = genRows(25, i => ({
  id: i,
  code: genCode("PR", i),
  processType: pick(["贴标", "组套", "分装"]),
  warehouseCode: pick(warehouses),
  ...mkMaterial(i),
  inputQty: randInt(100, 1000),
  outputQty: randInt(0, 900),
  status: pick(["pending", "processing", "finished", "finished", "cancelled"]),
  createdAt: pickDate(20, 0) + " 13:00:00"
}));

const crossdocks = genRows(18, i => ({
  id: i,
  code: genCode("XD", i),
  asnCode: genCode("ASN", i),
  outboundCode: genCode("OUT", i),
  warehouseCode: pick(warehouses),
  ...mkMaterial(i),
  qty: randInt(50, 600),
  status: pick(["pending", "processing", "finished", "finished", "cancelled"]),
  createdAt: pickDate(15, 0) + " 09:10:00"
}));

// ========================= 路由 =========================

export default defineFakeRoute([
  ...crudRoutes({
    prefix: "/wms/operation/task",
    seed: tasks,
    searchFields: ["taskNo", "bizNo", "materialCode", "materialName"]
  }),
  ...crudRoutes({
    prefix: "/wms/operation/replenish",
    seed: replenishes,
    searchFields: ["code", "materialCode", "materialName"]
  }),
  ...crudRoutes({
    prefix: "/wms/operation/process",
    seed: processes,
    searchFields: ["code", "materialCode", "materialName"]
  }),
  ...crudRoutes({
    prefix: "/wms/operation/crossdock",
    seed: crossdocks,
    searchFields: ["code", "asnCode", "outboundCode", "materialCode"]
  }),
  // 任务分配
  {
    url: "/wms/operation/task/assign",
    method: "post",
    response: ({ body }) => {
      const row = tasks.find(t => t.id === body?.id);
      if (!row) return fail("任务不存在");
      row.assignee = body?.assignee ?? "";
      row.status = "pending";
      return ok(true, "分配成功");
    }
  },
  {
    url: "/wms/operation/task/cancel",
    method: "post",
    response: ({ body }) => {
      const row = tasks.find(t => t.id === body?.id);
      if (!row) return fail("任务不存在");
      row.status = "cancelled";
      return ok(true, "已取消");
    }
  },
  // 补货完成
  {
    url: "/wms/operation/replenish/finish",
    method: "post",
    response: ({ body }) => {
      const row = replenishes.find(r => r.id === body?.id);
      if (!row) return fail("单据不存在");
      row.status = "finished";
      return ok(true, "补货完成");
    }
  },
  // 加工开工/完工
  {
    url: "/wms/operation/process/start",
    method: "post",
    response: ({ body }) => {
      const row = processes.find(p => p.id === body?.id);
      if (!row) return fail("加工单不存在");
      row.status = "processing";
      return ok(true, "已开工");
    }
  },
  {
    url: "/wms/operation/process/finish",
    method: "post",
    response: ({ body }) => {
      const row = processes.find(p => p.id === body?.id);
      if (!row) return fail("加工单不存在");
      row.outputQty = body?.outputQty ?? 0;
      row.status = "finished";
      return ok(true, "完工成功");
    }
  },
  // 越库执行
  {
    url: "/wms/operation/crossdock/execute",
    method: "post",
    response: ({ body }) => {
      const row = crossdocks.find(c => c.id === body?.id);
      if (!row) return fail("单据不存在");
      row.status = "finished";
      return ok(true, "越库执行完成");
    }
  }
]);

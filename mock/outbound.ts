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
const carriers = ["顺丰速运", "京东物流", "德邦快递", "自有车队"];
const customers = [
  "华东商贸有限公司",
  "联华超市",
  "美宜佳便利店",
  "精工机械股份",
  "日化集团"
];

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

const orders = genRows(50, i => ({
  id: i,
  code: genCode("OUT", i),
  warehouseCode: pick(warehouses),
  ownerName: pick([
    "货主A 华东电子",
    "货主B 精工机械",
    "货主C 日化用品",
    "自营"
  ]),
  customerName: pick(customers),
  type: pick(["sales", "sales", "sales", "transfer", "internal", "scrap"]),
  priority: pick(["urgent", "high", "normal", "normal", "low"]),
  ...mkMaterial(i),
  qty: randInt(10, 500),
  status: pick([
    "pending",
    "allocating",
    "picking_wait",
    "picking",
    "review",
    "shipping_wait",
    "shipped",
    "finished",
    "finished",
    "cancelled",
    "stockout"
  ]),
  deliveryDate: pickDate(-3, -10),
  remark: "",
  createdAt: pickDate(15, 0) + " 09:20:00"
}));

const waves = genRows(15, i => ({
  id: i,
  code: genCode("WV", i),
  warehouseCode: pick(warehouses),
  orderCount: randInt(5, 30),
  qty: randInt(100, 1500),
  carrierName: pick(carriers),
  status: pick(["pending", "processing", "finished", "finished", "cancelled"]),
  createdAt: pickDate(10, 0) + " 08:00:00"
}));

const locations = [
  "A-01-01",
  "A-01-02",
  "A-02-01",
  "B-03-02",
  "B-05-01",
  "C-01-03",
  "C-02-01",
  "D-02-02"
];
const pickings = genRows(45, i => ({
  id: i,
  taskNo: genCode("PK", i),
  waveCode: genCode("WV", randInt(1, 15)),
  orderCode: genCode("OUT", i),
  warehouseCode: pick(warehouses),
  locationCode: pick(locations),
  ...mkMaterial(i),
  pickQty: randInt(5, 200),
  status: pick(["pending", "processing", "finished", "finished", "cancelled"]),
  picker: pick(["user002", "user003", "user005"]),
  createdAt: pickDate(10, 0) + " 08:40:00"
}));

const packings = genRows(35, i => {
  const qty = randInt(5, 150);
  const status = pick(["waiting", "processing", "finished", "finished"]);
  return {
    id: i,
    code: genCode("CK", i),
    orderCode: genCode("OUT", i),
    waveCode: genCode("WV", randInt(1, 15)),
    ...mkMaterial(i),
    qty,
    checkedQty: status === "finished" ? qty : 0,
    weight: status === "finished" ? randInt(10, 500) : undefined,
    boxNo:
      status === "finished" ? `BOX${String(randInt(1000, 9999))}` : undefined,
    status,
    operator: pick(["user002", "user003"]),
    createdAt: pickDate(10, 0) + " 10:15:00"
  };
});

const shippings = genRows(30, i => ({
  id: i,
  code: genCode("DP", i),
  orderCode: genCode("OUT", i),
  carrierName: pick(carriers),
  vehicleNo: pick(["苏A", "粤B", "川A", "沪C"]) + String(randInt(10000, 99999)),
  driverName: pick(["陈师傅", "周师傅", "吴师傅"]),
  qty: randInt(10, 300),
  status: pick(["waiting", "shipped", "finished", "finished"]),
  shipDate: pickDate(8, 0),
  createdAt: pickDate(10, 0) + " 14:50:00"
}));

// ========================= 路由 =========================

export default defineFakeRoute([
  ...crudRoutes({
    prefix: "/wms/outbound/order",
    seed: orders,
    searchFields: ["code", "customerName", "materialCode", "materialName"]
  }),
  ...crudRoutes({
    prefix: "/wms/outbound/wave",
    seed: waves,
    searchFields: ["code"]
  }),
  ...crudRoutes({
    prefix: "/wms/outbound/picking",
    seed: pickings,
    searchFields: ["taskNo", "orderCode", "materialCode", "materialName"]
  }),
  ...crudRoutes({
    prefix: "/wms/outbound/packing",
    seed: packings,
    searchFields: ["code", "orderCode", "materialCode"]
  }),
  ...crudRoutes({
    prefix: "/wms/outbound/shipping",
    seed: shippings,
    searchFields: ["code", "orderCode"]
  }),
  // 出库单审批
  {
    url: "/wms/outbound/order/approve",
    method: "post",
    response: ({ body }) => {
      const row = orders.find(o => o.id === body?.id);
      if (!row) return fail("出库单不存在");
      row.status = body?.pass ? "allocating" : "cancelled";
      return ok(true, body?.pass ? "审核通过，进入分配" : "已取消");
    }
  },
  // 生成波次
  {
    url: "/wms/outbound/wave/generate",
    method: "post",
    response: ({ body }) => {
      const count =
        waves.filter(w => w.warehouseCode === body?.warehouseCode).length + 1;
      const row = {
        id: Date.now() % 100000,
        code: genCode("WV", count),
        warehouseCode: body?.warehouseCode ?? "WH001",
        orderCount: randInt(5, 25),
        qty: randInt(100, 1200),
        carrierName: body?.carrierName || pick(carriers),
        status: "pending",
        createdAt: new Date().toLocaleString("zh-CN", { hour12: false })
      };
      waves.unshift(row);
      return ok(row, "波次生成成功");
    }
  },
  // 波次下发拣货
  {
    url: "/wms/outbound/wave/release",
    method: "post",
    response: ({ body }) => {
      const row = waves.find(w => w.id === body?.id);
      if (!row) return fail("波次不存在");
      row.status = "processing";
      return ok(true, "已下发拣货");
    }
  },
  // 拣货开始/完成
  {
    url: "/wms/outbound/picking/start",
    method: "post",
    response: ({ body }) => {
      const row = pickings.find(p => p.id === body?.id);
      if (!row) return fail("任务不存在");
      row.status = "processing";
      return ok(true, "拣货已开始");
    }
  },
  {
    url: "/wms/outbound/picking/finish",
    method: "post",
    response: ({ body }) => {
      const row = pickings.find(p => p.id === body?.id);
      if (!row) return fail("任务不存在");
      row.status = "finished";
      return ok(true, "拣货完成");
    }
  },
  // 复核
  {
    url: "/wms/outbound/packing/check",
    method: "post",
    response: ({ body }) => {
      const row = packings.find(p => p.id === body?.id);
      if (!row) return fail("记录不存在");
      row.checkedQty = body?.checkedQty ?? 0;
      row.weight = body?.weight;
      row.boxNo = `BOX${String(randInt(1000, 9999))}`;
      row.status = "finished";
      return ok(true, "复核完成");
    }
  },
  // 发货确认
  {
    url: "/wms/outbound/shipping/confirm",
    method: "post",
    response: ({ body }) => {
      const row = shippings.find(s => s.id === body?.id);
      if (!row) return fail("交接单不存在");
      row.status = "shipped";
      return ok(true, "发货确认成功");
    }
  }
]);

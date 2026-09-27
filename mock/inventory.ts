import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  ok,
  fail,
  crudRoutes,
  genRows,
  pick,
  randInt,
  pickDate,
  genCode,
  dayStr
} from "./_db";

// ========================= 公共种子 =========================

const warehouses = [
  { code: "WH001", name: "上海主仓" },
  { code: "WH002", name: "广州华南仓" },
  { code: "WH003", name: "成都西南仓" }
];

const materials = genRows(40, i => ({
  code: `SKU${String(i).padStart(5, "0")}`,
  name:
    pick([
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
    ]) + `-${i}`
}));

const owners = ["货主A 华东电子", "货主B 精工机械", "货主C 日化用品", "自营"];
const locations = [
  "A-01-01",
  "A-01-02",
  "A-02-01",
  "B-03-02",
  "B-05-01",
  "C-01-03",
  "D-02-02"
];

function mkMaterial(i: number) {
  const m = materials[(i - 1) % materials.length];
  return { materialCode: m.code, materialName: m.name };
}
function mkWarehouse() {
  return pick(warehouses);
}

// ========================= 库存台账 =========================

const ledger = genRows(120, i => {
  const w = mkWarehouse();
  const m = mkMaterial(i);
  const qty = randInt(50, 2000);
  const locked = randInt(0, Math.floor(qty * 0.2));
  const status = pick([
    "qualified",
    "qualified",
    "qualified",
    "inspecting",
    "frozen"
  ]);
  return {
    id: i,
    warehouseCode: w.code,
    warehouseName: w.name,
    locationCode: pick(locations),
    ...m,
    batchNo: `B${String(randInt(2401, 2512)).padStart(4, "0")}`,
    stockStatus: status,
    qty,
    lockedQty: locked,
    availableQty: qty - locked,
    ownerName: pick(owners),
    expiredAt:
      Math.random() > 0.5
        ? dayStr(new Date(Date.now() + randInt(30, 720) * 86400000))
        : undefined,
    createdAt: pickDate(120, 0) + " 10:00:00"
  };
});

// ========================= 序列号 =========================

const serials = genRows(80, i => {
  const w = mkWarehouse();
  const m = mkMaterial(i);
  const status = pick([
    "instock",
    "instock",
    "allocated",
    "outbound",
    "repairing",
    "scrapped"
  ]);
  const inboundDate = pickDate(300, 10);
  return {
    id: i,
    serialNo: `SN${dayStr(new Date()).replaceAll("-", "")}${String(i).padStart(5, "0")}`,
    ...m,
    batchNo: `B${String(randInt(2401, 2512)).padStart(4, "0")}`,
    status,
    warehouseCode: w.code,
    locationCode: status === "outbound" ? undefined : pick(locations),
    inboundDate,
    outboundDate: status === "outbound" ? pickDate(10, 1) : undefined,
    orderNo:
      status === "allocated" || status === "outbound"
        ? genCode("SO", i)
        : undefined
  };
});

// ========================= 批次效期 =========================

const batches = genRows(60, i => {
  const w = mkWarehouse();
  const m = mkMaterial(i);
  const prodDate = pickDate(400, 30);
  const expDate = dayStr(
    new Date(new Date(prodDate).getTime() + randInt(90, 730) * 86400000)
  );
  const remainDays = Math.floor(
    (new Date(expDate).getTime() - Date.now()) / 86400000
  );
  return {
    id: i,
    ...m,
    batchNo: `B${String(randInt(2401, 2512)).padStart(4, "0")}`,
    warehouseCode: w.code,
    qty: randInt(20, 1500),
    productionDate: prodDate,
    expiredAt: expDate,
    remainDays,
    status: remainDays < 0 ? "expired" : remainDays < 30 ? "expiring" : "normal"
  };
});

// ========================= 移库 =========================

const moves = genRows(40, i => ({
  id: i,
  code: genCode("MV", i),
  moveType: pick(["location", "container", "transfer"]),
  ...mkWarehouse(),
  ...mkMaterial(i),
  batchNo: `B${String(randInt(2401, 2512)).padStart(4, "0")}`,
  fromLocation: pick(locations),
  toLocation: pick(locations),
  qty: randInt(10, 500),
  status: pick(["pending", "processing", "finished", "finished", "cancelled"]),
  operator: pick(["user002", "user003", "user005"]),
  createdAt: pickDate(30, 0) + " 09:30:00"
}));

// ========================= 库存调整 =========================

const adjustments = genRows(35, i => {
  const qtyBefore = randInt(100, 900);
  const change = pick([randInt(-50, -1), randInt(1, 60)]);
  return {
    id: i,
    code: genCode("ADJ", i),
    ...mkWarehouse(),
    ...mkMaterial(i),
    batchNo: `B${String(randInt(2401, 2512)).padStart(4, "0")}`,
    locationCode: pick(locations),
    adjustType: change > 0 ? "gain" : "loss",
    qtyBefore,
    qtyChange: change,
    qtyAfter: qtyBefore + change,
    reason: pick([
      "盘点差异",
      "破损报损",
      "抽样损耗",
      "收货误差",
      "温湿度变质"
    ]),
    status: pick(["pending", "approved", "approved", "rejected"]),
    applicant: pick(["user002", "user004"]),
    createdAt: pickDate(30, 0) + " 14:20:00"
  };
});

// ========================= 盘点 =========================

const stocktakes = genRows(20, i => ({
  id: i,
  code: genCode("PD", i),
  warehouseCode: pick(warehouses).code,
  mode: pick(["full", "cycle", "spot", "moving"]),
  status: pick(["draft", "counting", "diff", "finished", "finished"]),
  planDate: pickDate(20, -10),
  totalCount: randInt(20, 200),
  diffCount: randInt(0, 12),
  creator: pick(["admin", "user002"]),
  createdAt: pickDate(25, 5) + " 08:30:00"
}));

const stocktakeDetails = genRows(160, i => {
  const st = stocktakes[(i - 1) % stocktakes.length];
  const bookQty = randInt(10, 400);
  const counted =
    st.status === "draft"
      ? null
      : pick([bookQty, bookQty, bookQty + randInt(-5, 5)]);
  return {
    id: i,
    stocktakeId: st.id,
    locationCode: pick(locations),
    ...mkMaterial(i),
    batchNo: `B${String(randInt(2401, 2512)).padStart(4, "0")}`,
    bookQty,
    actualQty: counted,
    diffQty: counted === null ? 0 : counted - bookQty,
    countedBy: counted === null ? undefined : pick(["user002", "user003"])
  };
});

// ========================= 预警 =========================

const warnings = genRows(30, i => {
  const m = mkMaterial(i);
  const w = mkWarehouse();
  const type = pick(["low", "over", "dead", "expiring", "expired"]);
  return {
    id: i,
    warningType: type,
    ...m,
    warehouseCode: w.code,
    locationCode: pick(locations),
    batchNo: `B${String(randInt(2401, 2512)).padStart(4, "0")}`,
    qty: randInt(0, 800),
    safetyQty: randInt(100, 300),
    expiredAt:
      type === "expiring" || type === "expired"
        ? dayStr(
            new Date(
              Date.now() +
                (type === "expired" ? -randInt(1, 30) : randInt(1, 25)) *
                  86400000
            )
          )
        : undefined,
    days: type === "dead" ? randInt(95, 300) : undefined,
    status: i % 4 === 0 ? "handled" : "active",
    createdAt: pickDate(20, 0) + " 07:00:00"
  };
});

// ========================= 流水 =========================

const transactions = genRows(150, i => {
  const type = pick([
    "receive",
    "putaway",
    "sales",
    "transfer_out",
    "transfer_in",
    "move",
    "replenish",
    "stocktake",
    "gain",
    "loss"
  ]);
  const change = ["sales", "transfer_out", "loss"].includes(type)
    ? -randInt(1, 200)
    : randInt(1, 300);
  return {
    id: i,
    transactionNo: genCode("TR", i),
    transactionType: type,
    ...mkWarehouse(),
    locationCode: pick(locations),
    ...mkMaterial(i),
    batchNo: `B${String(randInt(2401, 2512)).padStart(4, "0")}`,
    qtyChange: change,
    balanceQty: randInt(100, 3000),
    bizNo: genCode(pick(["IN", "OUT", "MV", "PD"]), i),
    operator: pick(["admin", "user002", "user003", "system"]),
    createdAt: pickDate(30, 0) + " 11:00:00"
  };
});

// ========================= 路由 =========================

export default defineFakeRoute([
  ...crudRoutes({
    prefix: "/wms/inventory/ledger",
    seed: ledger,
    searchFields: ["materialCode", "materialName", "locationCode", "batchNo"]
  }),
  ...crudRoutes({
    prefix: "/wms/inventory/serial",
    seed: serials,
    searchFields: ["serialNo", "materialCode", "materialName"]
  }),
  ...crudRoutes({
    prefix: "/wms/inventory/batch",
    seed: batches,
    searchFields: ["materialCode", "materialName", "batchNo"]
  }),
  ...crudRoutes({
    prefix: "/wms/inventory/move",
    seed: moves,
    searchFields: ["code", "materialCode", "materialName"]
  }),
  ...crudRoutes({
    prefix: "/wms/inventory/adjustment",
    seed: adjustments,
    searchFields: ["code", "materialCode", "materialName"]
  }),
  ...crudRoutes({
    prefix: "/wms/inventory/stocktake",
    seed: stocktakes,
    searchFields: ["code"]
  }),
  ...crudRoutes({
    prefix: "/wms/inventory/warning",
    seed: warnings,
    searchFields: ["materialCode", "materialName"]
  }),
  ...crudRoutes({
    prefix: "/wms/inventory/transaction",
    seed: transactions,
    searchFields: ["transactionNo", "materialCode", "materialName", "bizNo"]
  }),
  // 台账冻结/解冻
  {
    url: "/wms/inventory/ledger/freeze",
    method: "post",
    response: ({ body }) => {
      const { ids, freeze } = body || {};
      for (const row of ledger) {
        if (ids?.includes(row.id))
          row.stockStatus = freeze ? "frozen" : "qualified";
      }
      return ok(true, freeze ? "冻结成功" : "解冻成功");
    }
  },
  // 序列号报废
  {
    url: "/wms/inventory/serial/scrap",
    method: "post",
    response: ({ body }) => {
      const { ids } = body || {};
      for (const row of serials) {
        if (ids?.includes(row.id)) row.status = "scrapped";
      }
      return ok(true, "报废成功");
    }
  },
  // 移库执行/取消
  {
    url: "/wms/inventory/move/execute",
    method: "post",
    response: ({ body }) => {
      const row = moves.find(m => m.id === body?.id);
      if (!row) return fail("单据不存在");
      row.status = "finished";
      return ok(true, "移库完成");
    }
  },
  {
    url: "/wms/inventory/move/cancel",
    method: "post",
    response: ({ body }) => {
      const row = moves.find(m => m.id === body?.id);
      if (!row) return fail("单据不存在");
      row.status = "cancelled";
      return ok(true, "已取消");
    }
  },
  // 调整审批
  {
    url: "/wms/inventory/adjustment/approve",
    method: "post",
    response: ({ body }) => {
      const row = adjustments.find(a => a.id === body?.id);
      if (!row) return fail("单据不存在");
      row.status = body?.pass ? "approved" : "rejected";
      return ok(true, body?.pass ? "审批通过" : "已驳回");
    }
  },
  // 盘点状态流转
  {
    url: "/wms/inventory/stocktake/start",
    method: "post",
    response: ({ body }) => {
      const row = stocktakes.find(s => s.id === body?.id);
      if (!row) return fail("单据不存在");
      row.status = "counting";
      return ok(true, "盘点已开始");
    }
  },
  {
    url: "/wms/inventory/stocktake/submit-diff",
    method: "post",
    response: ({ body }) => {
      const row = stocktakes.find(s => s.id === body?.id);
      if (!row) return fail("单据不存在");
      const details = stocktakeDetails.filter(d => d.stocktakeId === row.id);
      row.diffCount = details.filter(d => d.diffQty !== 0).length;
      row.status = "diff";
      return ok(true, "差异已提交");
    }
  },
  {
    url: "/wms/inventory/stocktake/finish",
    method: "post",
    response: ({ body }) => {
      const row = stocktakes.find(s => s.id === body?.id);
      if (!row) return fail("单据不存在");
      row.status = "finished";
      return ok(true, "盘点完成，差异已生成调整单");
    }
  },
  {
    url: "/wms/inventory/stocktake/cancel",
    method: "post",
    response: ({ body }) => {
      const row = stocktakes.find(s => s.id === body?.id);
      if (!row) return fail("单据不存在");
      row.status = "cancelled";
      return ok(true, "已取消");
    }
  },
  {
    url: "/wms/inventory/stocktake/detail-items",
    method: "get",
    response: ({ query }) => {
      const list = stocktakeDetails.filter(
        d => String(d.stocktakeId) === String(query.stocktakeId)
      );
      const page = Number(query.page ?? 1);
      const pageSize = Number(query.pageSize ?? 20);
      return ok({
        list: list.slice((page - 1) * pageSize, page * pageSize),
        total: list.length
      });
    }
  },
  {
    url: "/wms/inventory/stocktake/save-actual",
    method: "post",
    response: ({ body }) => {
      const row = stocktakeDetails.find(d => d.id === body?.detailId);
      if (!row) return fail("明细不存在");
      row.actualQty = body?.actualQty ?? 0;
      row.diffQty = row.actualQty - row.bookQty;
      row.countedBy = "当前用户";
      return ok(true, "已保存");
    }
  },
  // 预警处理
  {
    url: "/wms/inventory/warning/handle",
    method: "post",
    response: ({ body }) => {
      const row = warnings.find(w => w.id === body?.id);
      if (!row) return fail("记录不存在");
      row.status = "handled";
      return ok(true, "已处理");
    }
  }
]);

import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  ok,
  fail,
  crudRoutes,
  filterList,
  paginate,
  genRows,
  pick,
  randInt,
  pickDate,
  genCode,
  dayStr
} from "./_db";

// ========================= 公共种子 =========================

const owners = ["货主A 华东电子", "货主B 精工机械", "货主C 日化用品", "自营"];
const feeTypes = ["storage", "operation", "handling", "material", "transport"];
const units = ["托/天", "件", "次", "票"];
const confirmUsers = ["admin", "user002", "user005"];

/** 最近 n 个月账期（含当月），如 2026-09 */
function recentPeriods(n: number): string[] {
  const list: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    list.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return list;
}
const periods = recentPeriods(6);

// ========================= 计费规则 =========================

const rules = genRows(24, i => ({
  id: i,
  code: `FR${String(i).padStart(4, "0")}`,
  ownerName: owners[(i - 1) % owners.length],
  feeType: pick(feeTypes),
  unit: pick(units),
  price: +(randInt(50, 5000) / 100).toFixed(2),
  minimumFee: randInt(100, 2000),
  effectiveFrom: pickDate(300, 60),
  effectiveTo: dayStr(new Date(Date.now() + randInt(30, 365) * 86400000)),
  status: pick([1, 1, 1, 0]),
  createdAt: pickDate(120, 0) + " 09:00:00"
}));

// ========================= 费用账单 =========================

const bills = genRows(48, i => {
  const qty = randInt(200, 8000);
  const price = randInt(80, 3000) / 100;
  const status = pick([
    "pending",
    "pending",
    "confirmed",
    "confirmed",
    "invoiced",
    "settled",
    "disputed"
  ]);
  return {
    id: i,
    code: genCode("BILL", i),
    ownerName: pick(owners),
    period: pick(periods),
    feeType: pick(feeTypes),
    qty,
    amount: +(qty * price).toFixed(2),
    status,
    confirmUser: status === "pending" ? undefined : pick(confirmUsers),
    createdAt: pickDate(60, 0) + " 16:00:00"
  };
});

// ========================= 对账单 =========================

const recos = genRows(20, i => {
  const billCount = randInt(5, 40);
  const status = pick([
    "pending",
    "pending",
    "confirmed",
    "confirmed",
    "disputed"
  ]);
  return {
    id: i,
    code: genCode("REC", i),
    ownerName: pick(owners),
    period: pick(periods),
    billCount,
    totalAmount: billCount * randInt(800, 3500),
    diffAmount: pick([0, 0, 0, randInt(-2000, -50), randInt(50, 2000)]),
    status,
    createdAt: pickDate(45, 0) + " 18:00:00"
  };
});

// ========================= 路由 =========================

export default defineFakeRoute([
  ...crudRoutes({
    prefix: "/wms/billing/rule",
    seed: rules,
    searchFields: ["code", "ownerName"]
  }),
  // 账单：page 与状态流转端点共享同一数组，确认/开票/结算后刷新立即可见
  {
    url: "/wms/billing/bill/page",
    method: "get",
    response: ({ query }) =>
      paginate(filterList(bills, query, ["code", "ownerName"]), query)
  },
  {
    url: "/wms/billing/bill/confirm",
    method: "post",
    response: ({ body }) => {
      const row = bills.find(b => b.id === body?.id);
      if (!row) return fail("账单不存在");
      row.status = "confirmed";
      row.confirmUser = "admin";
      return ok(true, "账单已确认");
    }
  },
  {
    url: "/wms/billing/bill/invoice",
    method: "post",
    response: ({ body }) => {
      const row = bills.find(b => b.id === body?.id);
      if (!row) return fail("账单不存在");
      row.status = "invoiced";
      return ok(true, "开票成功");
    }
  },
  {
    url: "/wms/billing/bill/settle",
    method: "post",
    response: ({ body }) => {
      const row = bills.find(b => b.id === body?.id);
      if (!row) return fail("账单不存在");
      row.status = "settled";
      return ok(true, "结算完成");
    }
  },
  // 对账单：page 与确认/异议端点共享同一数组
  {
    url: "/wms/billing/reconcile/page",
    method: "get",
    response: ({ query }) =>
      paginate(filterList(recos, query, ["code", "ownerName"]), query)
  },
  {
    url: "/wms/billing/reconcile/confirm",
    method: "post",
    response: ({ body }) => {
      const row = recos.find(r => r.id === body?.id);
      if (!row) return fail("对账单不存在");
      row.status = "confirmed";
      return ok(true, "对账已确认");
    }
  },
  {
    url: "/wms/billing/reconcile/dispute",
    method: "post",
    response: ({ body }) => {
      const row = recos.find(r => r.id === body?.id);
      if (!row) return fail("对账单不存在");
      row.status = "disputed";
      return ok(true, "已提交异议");
    }
  }
]);

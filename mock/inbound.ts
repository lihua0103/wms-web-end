import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  ok,
  fail,
  crudRoutes,
  genRows,
  pick,
  randInt,
  pickDate,
  offsetStr,
  genCode
} from "./_db";

// ========================= 种子数据 =========================

const warehouses = ["WH001", "WH002", "WH003"];
const suppliers = ["华东电子供应有限公司", "精工机械原料厂", "日化包装材料商", "苏州轴承集团", "宁波紧固件厂"];
const owners = ["货主A 华东电子", "货主B 精工机械", "货主C 日化用品", "自营"];
const customers = ["华东商贸有限公司", "联华超市", "美宜佳便利店", "精工机械股份"];

function mkMaterial(i: number) {
  const code = `SKU${String(((i - 1) % 40) + 1).padStart(5, "0")}`;
  return {
    materialCode: code,
    materialName: ["不锈钢轴承", "伺服电机", "控制主板", "线束组件", "铝合金外壳", "橡胶密封圈", "包装纸箱", "缓冲泡沫", "标签贴纸", "螺丝套件"][(i - 1) % 10] + `-${(i - 1) % 40 + 1}`
  };
}

const asns = genRows(35, i => ({
  id: i,
  code: genCode("ASN", i),
  warehouseCode: pick(warehouses),
  ownerName: pick(owners),
  supplierName: pick(suppliers),
  type: pick(["purchase", "purchase", "return", "transfer", "other"]),
  expectedArrival: offsetStr(-randInt(0, 10) + randInt(0, 5)),
  status: pick(["draft", "pending", "approved", "finished", "finished", "cancelled"]),
  remark: "",
  createdAt: pickDate(20, 0) + " 10:30:00"
}));

const receipts = genRows(50, i => ({
  id: i,
  code: genCode("IN", i),
  asnCode: Math.random() > 0.2 ? genCode("ASN", randInt(1, 35)) : undefined,
  warehouseCode: pick(warehouses),
  supplierName: pick(suppliers),
  ...mkMaterial(i),
  batchNo: `B${String(randInt(2401, 2512)).padStart(4, "0")}`,
  receivedQty: randInt(50, 800),
  qualifiedQty: randInt(40, 780),
  rejectedQty: randInt(0, 20),
  status: pick(["pending", "waiting", "receiving", "qc", "putaway", "finished", "finished"]),
  receiver: pick(["user002", "user003"]),
  createdAt: pickDate(15, 0) + " 14:00:00"
}));

const qcs = genRows(40, i => ({
  id: i,
  code: genCode("QC", i),
  receiptCode: genCode("IN", i),
  ...mkMaterial(i),
  batchNo: `B${String(randInt(2401, 2512)).padStart(4, "0")}`,
  qcQty: randInt(20, 200),
  qcResult: pick(["waiting", "pass", "pass", "pass", "fail", "concession"]),
  qcUser: pick(["user006", "user007"]),
  qcRemark: "",
  createdAt: pickDate(15, 0) + " 15:30:00"
}));

const locations = ["A-01-01", "A-01-02", "A-02-01", "B-03-02", "B-05-01", "C-01-03", "D-02-02"];
const putaways = genRows(40, i => ({
  id: i,
  taskNo: genCode("PA", i),
  receiptCode: genCode("IN", i),
  warehouseCode: pick(warehouses),
  fromLocation: "RCV-0" + randInt(1, 4),
  toLocation: pick(locations),
  ...mkMaterial(i),
  qty: randInt(10, 300),
  status: pick(["pending", "processing", "finished", "finished", "cancelled"]),
  operator: pick(["user002", "user003"]),
  createdAt: pickDate(10, 0) + " 16:00:00"
}));

const returns = genRows(25, i => ({
  id: i,
  code: genCode("RT", i),
  warehouseCode: pick(warehouses),
  ownerName: pick(owners),
  customerName: pick(customers),
  ...mkMaterial(i),
  qty: randInt(5, 100),
  reason: pick(["质量问题", "错发", "客户拒收", "包装破损", "临期退货"]),
  status: pick(["pending", "approved", "receiving", "finished", "cancelled"]),
  createdAt: pickDate(20, 0) + " 11:00:00"
}));

// ========================= 路由 =========================

export default defineFakeRoute([
  ...crudRoutes({ prefix: "/wms/inbound/asn", seed: asns, searchFields: ["code", "supplierName", "ownerName"] }),
  ...crudRoutes({ prefix: "/wms/inbound/receipt", seed: receipts, searchFields: ["code", "asnCode", "materialCode", "materialName"] }),
  ...crudRoutes({ prefix: "/wms/inbound/qc", seed: qcs, searchFields: ["code", "receiptCode", "materialCode", "materialName"] }),
  ...crudRoutes({ prefix: "/wms/inbound/putaway", seed: putaways, searchFields: ["taskNo", "receiptCode", "materialCode", "materialName"] }),
  ...crudRoutes({ prefix: "/wms/inbound/return", seed: returns, searchFields: ["code", "customerName", "materialCode"] }),
  // ASN 审核
  {
    url: "/wms/inbound/asn/approve",
    method: "post",
    response: ({ body }) => {
      const row = asns.find(a => a.id === body?.id);
      if (!row) return fail("预约单不存在");
      row.status = body?.pass ? "approved" : "cancelled";
      return ok(true, body?.pass ? "审核通过" : "已取消");
    }
  },
  // 收货审核（待审核→待到货）
  {
    url: "/wms/inbound/receipt/audit",
    method: "post",
    response: ({ body }) => {
      const row = receipts.find(r => r.id === body?.id);
      if (!row) return fail("收货单不存在");
      row.status = "waiting";
      return ok(true, "审核通过");
    }
  },
  // 收货登记
  {
    url: "/wms/inbound/receipt/register",
    method: "post",
    response: ({ body }) => {
      const row = receipts.find(r => r.id === body?.id);
      if (!row) return fail("收货单不存在");
      row.receivedQty = body?.receivedQty ?? 0;
      row.qualifiedQty = body?.qualifiedQty ?? 0;
      row.rejectedQty = body?.rejectedQty ?? 0;
      row.status = "receiving";
      return ok(true, "收货登记成功");
    }
  },
  // 质检结果提交
  {
    url: "/wms/inbound/qc/submit",
    method: "post",
    response: ({ body }) => {
      const row = qcs.find(q => q.id === body?.id);
      if (!row) return fail("质检单不存在");
      row.qcResult = body?.qcResult ?? "pass";
      row.qcRemark = body?.qcRemark ?? "";
      return ok(true, "质检结果已提交");
    }
  },
  // 上架完成
  {
    url: "/wms/inbound/putaway/finish",
    method: "post",
    response: ({ body }) => {
      const row = putaways.find(p => p.id === body?.id);
      if (!row) return fail("任务不存在");
      row.status = "finished";
      return ok(true, "上架完成");
    }
  },
  // 退货审批
  {
    url: "/wms/inbound/return/approve",
    method: "post",
    response: ({ body }) => {
      const row = returns.find(r => r.id === body?.id);
      if (!row) return fail("退货单不存在");
      row.status = body?.pass ? "approved" : "cancelled";
      return ok(true, body?.pass ? "审批通过" : "已取消");
    }
  }
]);

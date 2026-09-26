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

const carriers = [
  { id: 1, code: "CAR001", name: "顺丰速运", carrierType: "third", contact: "王经理", phone: "021-55667788", serviceArea: "全国", settleType: "月结", status: 1, createdAt: pickDate(200, 100) + " 09:00:00" },
  { id: 2, code: "CAR002", name: "京东物流", carrierType: "third", contact: "李经理", phone: "010-88776655", serviceArea: "全国", settleType: "月结", status: 1, createdAt: pickDate(200, 100) + " 09:00:00" },
  { id: 3, code: "CAR003", name: "德邦快递", carrierType: "third", contact: "张经理", phone: "0512-66778899", serviceArea: "华东/华南", settleType: "现结", status: 1, createdAt: pickDate(180, 80) + " 09:00:00" },
  { id: 4, code: "CAR004", name: "自有车队", carrierType: "self", contact: "赵队长", phone: "13800001111", serviceArea: "长三角", settleType: "月结", status: 1, createdAt: pickDate(300, 200) + " 09:00:00" },
  { id: 5, code: "CAR005", name: "安能物流", carrierType: "third", contact: "孙经理", phone: "021-33445566", serviceArea: "全国", settleType: "月结", status: 0, createdAt: pickDate(150, 60) + " 09:00:00" }
];

const vehicles = genRows(20, i => ({
  id: i,
  vehicleNo: pick(["苏A", "粤B", "川A", "沪C"]) + String(randInt(10000, 99999)),
  driverName: pick(["陈师傅", "周师傅", "吴师傅", "郑师傅", "冯师傅"]) + i,
  phone: `139${String(randInt(10000000, 99999999))}`,
  vehicleType: pick(["厢式", "厢式", "平板", "冷藏"]),
  maxLoad: pick([3, 5, 8, 15]),
  carrierName: pick(["顺丰速运", "京东物流", "自有车队"]),
  status: pick(["空闲", "在途", "在途", "维修"]),
  remark: "",
  createdAt: pickDate(200, 30) + " 10:00:00"
}));

const dispatches = genRows(35, i => ({
  id: i,
  code: genCode("DP", i),
  orderCode: genCode("OUT", i),
  customerName: pick(["华东商贸有限公司", "精工机械股份", "日化集团", "联华超市", "美宜佳便利店"]) + (i % 5),
  address: pick(["上海市青浦区", "苏州市工业园区", "杭州市滨江区", "广州市白云区", "成都市高新区"]) + "xxx路" + randInt(1, 500) + "号",
  carrierName: pick(["顺丰速运", "京东物流", "德邦快递", "自有车队"]),
  vehicleNo: pick(["苏A", "粤B", "川A", "沪C"]) + String(randInt(10000, 99999)),
  driverName: pick(["陈师傅", "周师傅", "吴师傅"]),
  qty: randInt(10, 300),
  status: pick(["pending", "dispatched", "delivering", "signed", "signed", "error"]),
  createdAt: pickDate(15, 0) + " 16:20:00"
}));

const trackings = genRows(25, i => {
  const progress = randInt(5, 100);
  return {
    id: i,
    code: genCode("DP", i),
    carrierName: pick(["顺丰速运", "京东物流", "德邦快递", "自有车队"]),
    vehicleNo: pick(["苏A", "粤B", "川A", "沪C"]) + String(randInt(10000, 99999)),
    driverName: pick(["陈师傅", "周师傅", "吴师傅"]),
    fromCity: pick(["上海", "苏州", "广州", "成都"]),
    toCity: pick(["北京", "杭州", "武汉", "西安", "深圳"]),
    currentLocation: progress >= 100 ? "已签收" : pick(["G60 沪昆高速", "京沪高速淮安段", "沪蓉高速武汉段", "绕城高速"]),
    progress,
    status: progress >= 100 ? "signed" : "delivering",
    updatedAt: offsetStr(-randInt(0, 2))
  };
});

// ========================= 路由 =========================

export default defineFakeRoute([
  ...crudRoutes({ prefix: "/wms/transport/carrier", seed: carriers, searchFields: ["code", "name"] }),
  ...crudRoutes({ prefix: "/wms/transport/vehicle", seed: vehicles, searchFields: ["vehicleNo", "driverName"] }),
  ...crudRoutes({ prefix: "/wms/transport/dispatch", seed: dispatches, searchFields: ["code", "orderCode", "customerName"] }),
  ...crudRoutes({ prefix: "/wms/transport/tracking", seed: trackings, searchFields: ["code", "vehicleNo"] }),
  // 配送调度
  {
    url: "/wms/transport/dispatch/assign",
    method: "post",
    response: ({ body }) => {
      const row = dispatches.find(d => d.id === body?.id);
      if (!row) return fail("配送单不存在");
      row.carrierName = body?.carrierName ?? "";
      row.vehicleNo = body?.vehicleNo ?? "";
      row.driverName = body?.driverName ?? "";
      row.status = "dispatched";
      return ok(true, "调度成功");
    }
  },
  // 签收
  {
    url: "/wms/transport/dispatch/sign",
    method: "post",
    response: ({ body }) => {
      const row = dispatches.find(d => d.id === body?.id);
      if (!row) return fail("配送单不存在");
      row.status = "signed";
      return ok(true, "签收成功");
    }
  }
]);

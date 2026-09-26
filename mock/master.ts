import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  ok,
  crudRoutes,
  genRows,
  pick,
  randInt,
  pickDate
} from "./_db";

// ========================= 种子数据 =========================

const warehouses = [
  { id: 1, code: "WH001", name: "上海主仓", address: "上海市青浦区华新镇XX路88号", contact: "李强", phone: "021-66666666", type: "normal", area: 12000, areaUsed: 8600, status: 1, remark: "B2B 主力仓", createdAt: "2025-01-01 09:00:00" },
  { id: 2, code: "WH002", name: "广州华南仓", address: "广州市白云区XX路66号", contact: "陈涛", phone: "020-77777777", type: "normal", area: 9000, areaUsed: 5200, status: 1, remark: "", createdAt: "2025-02-01 09:00:00" },
  { id: 3, code: "WH003", name: "成都西南仓", address: "成都市双流区XX路18号", contact: "刘明", phone: "028-85556677", type: "cold", area: 6000, areaUsed: 2100, status: 1, remark: "冷链仓", createdAt: "2025-06-01 09:00:00" }
];

const zoneTypes = ["receiving", "storage", "picking", "buffer", "shipping", "return", "reject", "process"];
const zoneNames: Record<string, string> = {
  receiving: "收货区", storage: "存储区", picking: "拣货区", buffer: "暂存区",
  shipping: "发货区", return: "退货区", reject: "不合格品区", process: "加工区"
};

const zones = genRows(15, i => {
  const type = pick(zoneTypes);
  const wh = pick(warehouses);
  return {
    id: i,
    warehouseCode: wh.code,
    code: `${wh.code.slice(-1)}Z${String(i).padStart(2, "0")}`,
    name: `${wh.name}${zoneNames[type]}`,
    zoneType: type,
    locationCount: randInt(20, 200),
    status: 1,
    remark: "",
    createdAt: pickDate(300, 30) + " 10:00:00"
  };
});

const locations = genRows(80, i => {
  const zone = pick(zones);
  const row = randInt(1, 6);
  const col = randInt(1, 10);
  const floor = randInt(1, 4);
  return {
    id: i,
    warehouseCode: zone.warehouseCode,
    zoneCode: zone.code,
    code: `${zone.code}-${String(row).padStart(2, "0")}-${String(col).padStart(2, "0")}-${floor}`,
    locationType: pick(["floor", "shelf", "shelf", "stereo", "pick", "cache"]),
    row,
    col,
    floor,
    maxWeight: pick([500, 1000, 2000]),
    maxVolume: pick([0.5, 1, 2]),
    status: pick(["idle", "occupied", "occupied", "disabled"]),
    isMix: Math.random() > 0.5 ? 1 : 0,
    remark: "",
    createdAt: pickDate(300, 30) + " 10:00:00"
  };
});

const ownerNames = ["货主A 华东电子", "货主B 精工机械", "货主C 日化用品", "自营"];

const materials = genRows(40, i => ({
  id: i,
  code: `SKU${String(i).padStart(5, "0")}`,
  name: ["不锈钢轴承", "伺服电机", "控制主板", "线束组件", "铝合金外壳", "橡胶密封圈", "包装纸箱", "缓冲泡沫", "标签贴纸", "螺丝套件"][(i - 1) % 10] + `-${i}`,
  category: pick(["raw", "semi", "finished", "packing", "consumable", "spare"]),
  spec: `规格${pick(["A", "B", "C"])}-${randInt(10, 99)}`,
  unit: pick(["件", "箱", "托", "米"]),
  barcode: `69${String(randInt(100000000000, 999999999999))}`,
  ownerName: pick(ownerNames),
  isExpiry: Math.random() > 0.6 ? 1 : 0,
  isSerial: Math.random() > 0.85 ? 1 : 0,
  safetyQty: randInt(50, 500),
  price: randInt(10, 5000) / 10,
  status: 1,
  remark: ""
}));

const partners = genRows(20, i => ({
  id: i,
  code: `P${String(i).padStart(4, "0")}`,
  name: pick(["华东电子供应有限公司", "精工机械原料厂", "日化包装材料商", "苏州轴承集团", "宁波紧固件厂"]) + i,
  contact: pick(["王经理", "李经理", "张经理", "刘经理"]),
  phone: `13${randInt(0, 9)}${String(randInt(10000000, 99999999))}`,
  address: pick(["上海市", "苏州市", "宁波市", "杭州市"]) + "XX区XX路" + randInt(1, 200) + "号",
  status: Math.random() > 0.1 ? 1 : 0,
  remark: "",
  createdAt: pickDate(300, 30) + " 11:00:00"
}));

const customers = genRows(20, i => ({
  id: i,
  code: `C${String(i).padStart(4, "0")}`,
  name: pick(["华东商贸有限公司", "联华超市", "美宜佳便利店", "精工机械股份", "日化集团"]) + i,
  contact: pick(["周经理", "吴经理", "郑经理", "冯经理"]),
  phone: `13${randInt(0, 9)}${String(randInt(10000000, 99999999))}`,
  address: pick(["上海市", "广州市", "成都市", "北京市"]) + "XX区XX路" + randInt(1, 200) + "号",
  status: Math.random() > 0.1 ? 1 : 0,
  remark: "",
  createdAt: pickDate(300, 30) + " 12:00:00"
}));

const owners = genRows(12, i => ({
  id: i,
  code: `OW${String(i).padStart(3, "0")}`,
  name: pick(ownerNames) + (i > 4 ? i : ""),
  contact: pick(["王经理", "李经理", "张经理", "刘经理"]),
  phone: `13${randInt(0, 9)}${String(randInt(10000000, 99999999))}`,
  address: pick(["上海市", "苏州市", "宁波市"]) + "XX区XX路" + randInt(1, 200) + "号",
  settleType: pick(["月结", "现结"]),
  status: 1,
  remark: "",
  createdAt: pickDate(300, 30) + " 09:00:00"
}));

const containers = genRows(50, i => {
  const wh = pick(warehouses);
  const status = pick(["idle", "occupied", "instock", "shipping", "scrapped"]);
  return {
    id: i,
    code: `${pick(["PLT", "BOX", "BIN", "CGE"])}${String(i).padStart(5, "0")}`,
    containerType: pick(["pallet", "box", "bin", "cage"]),
    warehouseCode: wh.code,
    status,
    materialCode: status === "instock" || status === "occupied" ? `SKU${String(randInt(1, 40)).padStart(5, "0")}` : undefined,
    locationCode: status === "instock" ? `${wh.code.slice(-1)}Z01-01-01-1` : undefined,
    remark: "",
    createdAt: pickDate(300, 30) + " 13:00:00"
  };
});

// ========================= 路由 =========================

export default defineFakeRoute([
  ...crudRoutes({ prefix: "/wms/master/warehouse", seed: warehouses, searchFields: ["code", "name"] }),
  ...crudRoutes({ prefix: "/wms/master/zone", seed: zones, searchFields: ["code", "name"] }),
  ...crudRoutes({ prefix: "/wms/master/location", seed: locations, searchFields: ["code"] }),
  ...crudRoutes({ prefix: "/wms/master/material", seed: materials, searchFields: ["code", "name", "barcode"] }),
  ...crudRoutes({ prefix: "/wms/master/owner", seed: owners, searchFields: ["code", "name"] }),
  ...crudRoutes({ prefix: "/wms/master/supplier", seed: partners, searchFields: ["code", "name"] }),
  ...crudRoutes({ prefix: "/wms/master/customer", seed: customers, searchFields: ["code", "name"] }),
  ...crudRoutes({ prefix: "/wms/master/container", seed: containers, searchFields: ["code", "materialCode"] }),
  // 库位批量生成
  {
    url: "/wms/master/location/generate",
    method: "post",
    response: ({ body }) => {
      const { warehouseCode, zoneCode, prefix, row, col, floor } = body || {};
      let count = 0;
      for (let r = 1; r <= (row || 1); r++) {
        for (let c = 1; c <= (col || 1); c++) {
          for (let f = 1; f <= (floor || 1); f++) {
            locations.unshift({
              id: Date.now() + count,
              warehouseCode,
              zoneCode,
              code: `${prefix}-${String(r).padStart(2, "0")}-${String(c).padStart(2, "0")}-${f}`,
              locationType: "shelf",
              row: r,
              col: c,
              floor: f,
              maxWeight: 1000,
              maxVolume: 1,
              status: "idle",
              isMix: 0
            });
            count++;
          }
        }
      }
      return ok(count, `成功生成 ${count} 个库位`);
    }
  }
]);

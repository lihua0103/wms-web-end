import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  ok,
  fail,
  crudRoutes,
  genRows,
  pick,
  randInt,
  nowStr,
  genCode,
  fmtDate
} from "./_db";

// ========================= 公共种子 =========================

/** n 分钟前的时间字符串 */
function minutesAgo(min: number): string {
  return fmtDate(new Date(Date.now() - min * 60000));
}

/** n 小时前的时间字符串 */
function hoursAgo(h: number): string {
  return fmtDate(new Date(Date.now() - h * 3600000));
}

// ========================= 设备 =========================

// code, name, deviceType, warehouseCode, zoneCode, status, vendor, ip
const deviceSeeds: Array<
  [string, string, string, string, string, string, string, string]
> = [
  [
    "AGV-001",
    "AGV 搬运小车 01",
    "agv",
    "WH001",
    "C",
    "working",
    "极智嘉",
    "192.168.10.11"
  ],
  [
    "AGV-002",
    "AGV 搬运小车 02",
    "agv",
    "WH001",
    "C",
    "online",
    "极智嘉",
    "192.168.10.12"
  ],
  [
    "AGV-003",
    "AGV 搬运小车 03",
    "agv",
    "WH001",
    "B",
    "charging",
    "快仓智能",
    "192.168.10.13"
  ],
  [
    "AGV-004",
    "AGV 搬运小车 04",
    "agv",
    "WH002",
    "B",
    "online",
    "快仓智能",
    "192.168.10.14"
  ],
  [
    "AGV-005",
    "AGV 搬运小车 05",
    "agv",
    "WH002",
    "C",
    "error",
    "海康机器人",
    "192.168.10.15"
  ],
  [
    "AGV-006",
    "AGV 搬运小车 06",
    "agv",
    "WH003",
    "B",
    "offline",
    "海康机器人",
    "192.168.10.16"
  ],
  [
    "SS-01",
    "堆垛机 01",
    "stacker",
    "WH001",
    "B",
    "working",
    "音飞储存",
    "192.168.20.11"
  ],
  [
    "SS-02",
    "堆垛机 02",
    "stacker",
    "WH003",
    "B",
    "online",
    "诺力智能",
    "192.168.20.12"
  ],
  [
    "CV-01",
    "输送线 01",
    "conveyor",
    "WH001",
    "A",
    "online",
    "德马科技",
    "192.168.30.11"
  ],
  [
    "CV-02",
    "输送线 02",
    "conveyor",
    "WH001",
    "D",
    "working",
    "德马科技",
    "192.168.30.12"
  ],
  [
    "CV-03",
    "输送线 03",
    "conveyor",
    "WH002",
    "D",
    "online",
    "德马科技",
    "192.168.30.13"
  ],
  [
    "CV-04",
    "输送线 04",
    "conveyor",
    "WH003",
    "D",
    "repairing",
    "德马科技",
    "192.168.30.14"
  ],
  [
    "PTL-A1",
    "电子标签拣选系统 A1",
    "ptl",
    "WH001",
    "C",
    "online",
    "远望谷",
    "192.168.40.11"
  ],
  [
    "SJ-01",
    "交叉带分拣机 01",
    "sorter",
    "WH002",
    "D",
    "working",
    "中科微至",
    "192.168.50.11"
  ]
];

const devices = deviceSeeds.map(
  (
    [code, name, deviceType, warehouseCode, zoneCode, status, vendor, ip],
    idx
  ) => ({
    id: idx + 1,
    code,
    name,
    deviceType,
    warehouseCode,
    zoneCode,
    status,
    lastHeartbeat: ["online", "working", "charging"].includes(status)
      ? minutesAgo(randInt(0, 5))
      : minutesAgo(randInt(30, 2880)),
    vendor,
    ip
  })
);

// ========================= AGV 任务 =========================

const agvLocations = [
  "A-01-01",
  "A-02-02",
  "B-03-01",
  "B-05-02",
  "C-01-02",
  "C-02-03",
  "D-01-01",
  "D-02-02"
];

const agvTasks = genRows(42, i => {
  const status = pick([
    "queued",
    "queued",
    "executing",
    "executing",
    "finished",
    "finished",
    "finished",
    "failed",
    "cancelled"
  ]);
  return {
    id: i,
    taskNo: genCode("AGV", i),
    agvCode: `AGV-00${randInt(1, 6)}`,
    taskType: pick(["搬运", "搬运", "搬运", "入库", "出库", "充电"]),
    fromLocation: pick(agvLocations),
    toLocation: pick(agvLocations),
    status,
    priority: randInt(1, 5),
    createdAt: hoursAgo(randInt(1, 96))
  };
});

// ========================= 设备任务 =========================

const deviceTasks = genRows(60, i => {
  const device = pick(devices);
  const status = pick([
    "queued",
    "executing",
    "executing",
    "finished",
    "finished",
    "finished",
    "failed",
    "cancelled"
  ]);
  const ago = randInt(1, 120);
  return {
    id: i,
    taskNo: genCode("WT", i),
    deviceCode: device.code,
    deviceType: device.deviceType,
    bizNo: genCode(pick(["IN", "PA", "OUT", "PK", "MV"]), i),
    qty: randInt(1, 300),
    status,
    createdAt: hoursAgo(ago),
    finishedAt:
      status === "finished"
        ? hoursAgo(Math.max(0, ago - randInt(1, 4)))
        : undefined
  };
});

// ========================= 集成配置 =========================

const configSeeds: Array<[string, string, string, string, string, string]> = [
  // systemName, systemType, apiUrl, authType, status, syncDirection
  [
    "用友 U8 ERP",
    "erp",
    "http://192.168.1.50:8080/u8api",
    "token",
    "enabled",
    "down"
  ],
  [
    "订单中台 OMS",
    "oms",
    "https://oms.demo.com/openapi",
    "signature",
    "enabled",
    "down"
  ],
  [
    "汇川 WCS 设备层",
    "wcs",
    "http://192.168.10.20:9000/wcs/api",
    "token",
    "enabled",
    "up"
  ],
  [
    "快递鸟 TMS",
    "tms",
    "https://tms.demo.com/api",
    "signature",
    "disabled",
    "up"
  ],
  [
    "天猫电商平台",
    "ecom",
    "https://api.tmall.demo.com/router",
    "token",
    "enabled",
    "down"
  ],
  [
    "京东电商平台",
    "ecom",
    "https://api.jd.demo.com/router",
    "token",
    "disabled",
    "up"
  ]
];

const configs = configSeeds.map(
  ([systemName, systemType, apiUrl, authType, status, syncDirection], idx) => ({
    id: idx + 1,
    systemName,
    systemType,
    apiUrl,
    authType,
    status,
    syncDirection,
    lastSyncTime:
      status === "enabled"
        ? minutesAgo(randInt(1, 30))
        : minutesAgo(randInt(1440, 10080))
  })
);

const logSystems = configs.map(c => c.systemName);

// ========================= 接口日志 =========================

const downPaths = [
  "/api/order/push",
  "/api/asn/sync",
  "/api/material/sync",
  "/api/supplier/sync",
  "/api/order/cancel"
];
const upPaths = [
  "/wms/api/stock/report",
  "/wms/api/outbound/report",
  "/wms/api/task/status",
  "/wms/api/inventory/sync",
  "/wms/api/shipment/finish"
];

const errorMessages = [
  "调用超时：上游系统 60 秒内未响应（HTTP 504），请求已转入重试队列，traceId=9f8e7d6c5b4a3210",
  "返回报文校验失败：缺少必填节点 orderNo，原始报文已归档至 /data/logs/integration/failed 目录",
  "认证失败：access_token 已过期或签名不匹配（signature=3F8A…），请重新获取令牌后重试",
  "目标系统返回业务错误：库存不足，无法分配批次 B2506，错误码 ERR_STOCK_NOT_ENOUGH"
];

const apiLogs = genRows(100, i => {
  const direction = pick(["down", "down", "up", "up"]);
  const status = pick([
    "success",
    "success",
    "success",
    "success",
    "success",
    "success",
    "success",
    "fail",
    "retry"
  ]);
  const failed = status !== "success";
  const requestId = genCode("REQ", i);
  const systemName = pick(logSystems);
  const apiPath = direction === "down" ? pick(downPaths) : pick(upPaths);
  return {
    id: i,
    requestId,
    systemName,
    apiPath,
    direction,
    duration: failed ? randInt(1000, 8000) : randInt(18, 900),
    status,
    errorMsg: failed ? pick(errorMessages) : undefined,
    requestSummary: JSON.stringify({
      requestId,
      system: systemName,
      path: apiPath,
      timestamp: hoursAgo(randInt(1, 72)),
      body: {
        bizNo: genCode(pick(["SO", "ASN"]), i),
        lines: randInt(1, 10),
        operator: "integration"
      }
    }),
    responseSummary: failed
      ? JSON.stringify({
          code: randInt(500, 599),
          msg: pick(["gateway timeout", "bad gateway", "internal error"]),
          data: null
        })
      : JSON.stringify({
          code: 0,
          msg: "ok",
          data: {
            accepted: true,
            taskNo: genCode("WT", i),
            cost: randInt(10, 200)
          }
        }),
    createdAt: hoursAgo(randInt(1, 72))
  };
});

// ========================= 路由 =========================

export default defineFakeRoute([
  ...crudRoutes({
    prefix: "/wms/integration/device",
    seed: devices,
    searchFields: ["code", "name", "ip", "vendor"]
  }),
  ...crudRoutes({
    prefix: "/wms/integration/agv",
    seed: agvTasks,
    searchFields: ["taskNo", "agvCode"]
  }),
  ...crudRoutes({
    prefix: "/wms/integration/devicetask",
    seed: deviceTasks,
    searchFields: ["taskNo", "deviceCode", "bizNo"]
  }),
  ...crudRoutes({
    prefix: "/wms/integration/config",
    seed: configs,
    searchFields: ["systemName", "apiUrl"]
  }),
  ...crudRoutes({
    prefix: "/wms/integration/apilog",
    seed: apiLogs,
    searchFields: ["requestId", "systemName", "apiPath"]
  }),
  // 设备启停
  {
    url: "/wms/integration/device/toggle",
    method: "post",
    response: ({ body }) => {
      const row = devices.find(d => d.id === body?.id);
      if (!row) return fail("设备不存在");
      row.status = body?.enable ? "online" : "offline";
      row.lastHeartbeat = nowStr();
      return ok(true, body?.enable ? "设备已启用" : "设备已停用");
    }
  },
  // AGV 下发任务（即新增）
  {
    url: "/wms/integration/agv/dispatch",
    method: "post",
    response: ({ body }) => {
      const row = {
        id: Date.now(),
        taskNo: genCode("AGV", agvTasks.length + 1),
        agvCode: body?.agvCode,
        taskType: body?.taskType,
        fromLocation: body?.fromLocation,
        toLocation: body?.toLocation,
        priority: body?.priority ?? 3,
        status: "queued",
        createdAt: nowStr()
      };
      agvTasks.unshift(row);
      return ok(row, "任务已下发");
    }
  },
  // AGV 失败任务重新下发（failed → queued）
  {
    url: "/wms/integration/agv/retry",
    method: "post",
    response: ({ body }) => {
      const row = agvTasks.find(t => t.id === body?.id);
      if (!row) return fail("任务不存在");
      row.status = "queued";
      row.createdAt = nowStr();
      return ok(true, "已重新下发");
    }
  },
  // 设备任务取消（状态 → cancelled）
  {
    url: "/wms/integration/devicetask/cancel",
    method: "post",
    response: ({ body }) => {
      const row = deviceTasks.find(t => t.id === body?.id);
      if (!row) return fail("任务不存在");
      row.status = "cancelled";
      row.finishedAt = nowStr();
      return ok(true, "任务已取消");
    }
  },
  // 集成配置连接测试
  {
    url: "/wms/integration/config/test",
    method: "post",
    response: ({ body }) => {
      const row = configs.find(c => c.id === body?.id);
      if (!row) return fail("配置不存在");
      row.lastSyncTime = nowStr();
      return ok({ success: true, duration: randInt(30, 300) }, "连接成功");
    }
  }
]);

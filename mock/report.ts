import { defineFakeRoute } from "vite-plugin-fake-server/client";
import { ok, genRows, pick, randInt, dayStr, offsetStr } from "./_db";

// ========================= 公共种子 =========================

const warehouses = ["WH001 上海主仓", "WH002 广州华南仓", "WH003 成都西南仓"];
const categories = ["原材料", "半成品", "成品", "包材", "耗材", "备品备件"];
const taskTypes = [
  "收货",
  "质检",
  "上架",
  "补货",
  "拣货",
  "复核",
  "移库",
  "盘点"
];
const persons = [
  "张伟",
  "李娜",
  "王强",
  "赵敏",
  "刘洋",
  "陈静",
  "杨帆",
  "周婷"
];
const zones = ["A 收货区", "B 存储区", "C 拣货区", "D 发货区"];

const alarmTexts = [
  "AGV-03 电量低于 20%，已自动返回充电",
  "B 存储区温度 28.6℃，超过阈值",
  "出库口 2 纸箱堵塞，输送线已暂停",
  "ERP 接口同步重试成功",
  "D 发货区月台占用超时 30 分钟",
  "SKU00012 盘点差异待处理",
  "堆垛机 SR-01 作业超时告警",
  "波次拣货超时提醒"
];

// ========================= 路由 =========================

export default defineFakeRoute([
  // 库存看板
  {
    url: "/wms/report/dashboard",
    method: "get",
    response: () =>
      ok({
        stockSummary: {
          totalQty: randInt(180000, 260000),
          totalValue: randInt(12000000, 18000000),
          skuCount: randInt(1200, 1600),
          warningCount: randInt(8, 30)
        },
        categoryStock: categories.map(name => ({
          name,
          value: randInt(20000, 60000)
        })),
        warehouseStock: warehouses.map(name => ({
          name,
          value: randInt(40000, 90000)
        })),
        stockAge: [
          { name: "0-30天", value: randInt(50000, 80000) },
          { name: "31-60天", value: randInt(30000, 50000) },
          { name: "61-90天", value: randInt(15000, 30000) },
          { name: "90天以上", value: randInt(3000, 12000) }
        ],
        turnoverTop: genRows(10, i => ({
          name: `SKU${String(((i * 7) % 40) + 1).padStart(5, "0")}`,
          turnover: +(randInt(20, 120) / 10).toFixed(1)
        })).sort((a, b) => b.turnover - a.turnover)
      })
  },
  // 出入库报表（近 30 天，支持日期范围与仓库筛选）
  {
    url: "/wms/report/inout",
    method: "get",
    response: ({ query }) => {
      const factor =
        query?.warehouseCode === "WH002"
          ? 0.62
          : query?.warehouseCode === "WH003"
            ? 0.45
            : 1;
      const list = genRows(30, i => {
        const d = new Date(Date.now() - (30 - i) * 86400000);
        const inboundQty = Math.round(randInt(800, 2600) * factor);
        const outboundQty = Math.round(randInt(700, 2400) * factor);
        return {
          date: dayStr(d),
          inboundQty,
          outboundQty,
          inboundAmount: +(inboundQty * (randInt(60, 200) / 10)).toFixed(2),
          outboundAmount: +(outboundQty * (randInt(60, 200) / 10)).toFixed(2)
        };
      });
      const filtered = list.filter(row => {
        if (query?.startDate && row.date < String(query.startDate))
          return false;
        if (query?.endDate && row.date > String(query.endDate)) return false;
        return true;
      });
      const total = filtered.reduce(
        (acc, row) => ({
          inboundQty: acc.inboundQty + row.inboundQty,
          outboundQty: acc.outboundQty + row.outboundQty,
          inboundAmount: +(acc.inboundAmount + row.inboundAmount).toFixed(2),
          outboundAmount: +(acc.outboundAmount + row.outboundAmount).toFixed(2)
        }),
        { inboundQty: 0, outboundQty: 0, inboundAmount: 0, outboundAmount: 0 }
      );
      return ok({ list: filtered, total });
    }
  },
  // 作业效率
  {
    url: "/wms/report/efficiency",
    method: "get",
    response: () =>
      ok({
        personList: persons
          .map(name => ({
            name,
            taskCount: randInt(60, 320),
            avgMinutes: randInt(3, 25),
            errorRate: +(randInt(0, 80) / 1000).toFixed(3)
          }))
          .sort((a, b) => b.taskCount - a.taskCount),
        typeList: taskTypes.map(type => ({ type, count: randInt(80, 600) }))
      })
  },
  // 数据大屏
  {
    url: "/wms/report/screen",
    method: "get",
    response: () => {
      const hourlyFlow = genRows(24, i => {
        const peak = i >= 9 && i <= 18 ? randInt(20, 120) : 0;
        return {
          hour: `${String(i).padStart(2, "0")}:00`,
          inbound: randInt(10, 60) + peak,
          outbound: randInt(10, 60) + peak
        };
      });
      const alarmList = genRows(8, () => ({
        time: offsetStr(0, -randInt(0, 240)).slice(11),
        text: pick(alarmTexts),
        level: pick(["high", "medium", "low", "low"])
      })).sort((a, b) => (a.time < b.time ? 1 : -1));
      return ok({
        todayInbound: randInt(800, 2600),
        todayOutbound: randInt(700, 2400),
        onlineDevices: randInt(20, 36),
        taskPending: randInt(5, 60),
        hourlyFlow,
        zoneFill: zones.map(name => ({ name, percent: randInt(45, 98) })),
        alarmList
      });
    }
  }
]);

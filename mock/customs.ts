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
  nowStr,
  genCode,
  pickDate,
  fmtDate
} from "./_db";

// ========================= 公共种子 =========================

/** n 天后的日期字符串 */
function futureDate(days: number): string {
  return fmtDate(new Date(Date.now() + days * 86400000)).slice(0, 10);
}

/** n 天前+随机小时的完整时间字符串 */
function pastTime(days: number): string {
  const d = new Date(Date.now() - days * 86400000 - randInt(0, 10) * 3600000);
  return fmtDate(d);
}

// 料号池：物料编码、品名、单位、HS 编码
const goodsPool: Array<[string, string, string, string]> = [
  ["SKU00001", "无线蓝牙耳机", "个", "8518300000"],
  ["SKU00002", "智能手环", "个", "8517629900"],
  ["SKU00003", "机械键盘", "把", "8471607000"],
  ["SKU00004", "不锈钢保温杯", "只", "9617000000"],
  ["SKU00005", "电动牙刷", "支", "8509809000"],
  ["SKU00006", "移动电源", "个", "8507600090"],
  ["SKU00007", "氨基酸洗面奶", "瓶", "3304990091"],
  ["SKU00008", "保湿面霜", "盒", "3304990092"],
  ["SKU00009", "婴儿纸尿裤", "包", "9619001900"],
  ["SKU00010", "复合维生素片", "瓶", "2106909090"],
  ["SKU00011", "微型减速电机", "台", "8501520000"],
  ["SKU00012", "精密轴承", "套", "8482102000"]
];

const currencies = ["USD", "CNY", "USD", "EUR"];

// ========================= 海关账册 =========================

const enterprises: Array<[string, string, string]> = [
  ["上海智联保税物流有限公司", "3122660W01", "91310000MA1FL8001A"],
  ["上海云仓跨境电子商务有限公司", "3122966C02", "91310000MA1K9T002B"],
  ["广州华南保税供应链有限公司", "4401660W03", "91440100MA9UCP003C"],
  ["成都西南保税物流中心有限公司", "5101660W04", "91510100MA6CXL004D"],
  ["上海外高桥国际贸易有限公司", "3122210E05", "91310000MA1FL7005E"],
  ["杭州跨境电商保税仓储有限公司", "3301966C06", "91330100MA2H1B006F"]
];

const ledgers = enterprises.map(
  ([enterpriseName, customsCode, creditCode], idx) => {
    const ledgerNo = `L2631W${String(idx + 1).padStart(5, "0")}`;
    const ledgerType = pick([
      "bonded_logistics",
      "bonded_logistics",
      "bonded_logistics",
      "process_trade",
      "export_warehouse"
    ]);
    const status = pick([
      "active",
      "active",
      "active",
      "active",
      "changing",
      "expired"
    ]);
    const start = goodsPool.slice(randInt(0, 4), randInt(8, 12));
    return {
      id: idx + 1,
      ledgerNo,
      ledgerType,
      enterpriseName,
      customsCode,
      creditCode,
      supervisionMode: pick(["1233", "1210", "5034", "1239"]),
      validFrom: pickDate(700, 300),
      validTo:
        status === "expired"
          ? pickDate(120, 20)
          : futureDate(randInt(100, 700)),
      status,
      goods: start.map(([skuCode, name, unit], g) => {
        const declaredQty = randInt(500, 50000);
        const usedQty = Math.round(declaredQty * (randInt(10, 70) / 100));
        return {
          gNo: `G${String(g + 1).padStart(3, "0")}`,
          skuCode,
          name,
          unit,
          declaredQty,
          usedQty,
          availQty: declaredQty - usedQty
        };
      }),
      remark: ""
    };
  }
);

const ledgerNoPool = ledgers.map(l => l.ledgerNo);

// ========================= 核注清单 =========================

const verifyStatuses = [
  "deducted",
  "deducted",
  "deducted",
  "deducted",
  "deducted",
  "passed",
  "passed",
  "declared",
  "declared",
  "draft",
  "draft",
  "refused",
  "cancelled"
];

const refusedReasons = [
  "商品编号与账册备案料号不一致，请核对后重新申报",
  "申报数量超出账册可用量，请调整后重新申报",
  "净重与毛重比例异常，退回补正",
  "监管证件缺失：需提供 3C 认证证书后重新申报"
];

const verifyLists = genRows(28, i => {
  const status = pick(verifyStatuses);
  const declared = status !== "draft";
  const goods = genRows(randInt(3, 5), g => {
    const [_skuCode, name, unit, hsCode] = pick(goodsPool);
    const qty = randInt(20, 800);
    const gross = qty * (randInt(15, 60) / 100);
    return {
      gNo: `G${String(g).padStart(3, "0")}`,
      hsCode,
      name,
      qty,
      unit,
      price: randInt(5, 200) + randInt(0, 99) / 100,
      currency: pick(currencies),
      grossWeight: Math.round(gross * 100) / 100,
      netWeight: Math.round(gross * 0.86 * 100) / 100
    };
  });
  return {
    id: i,
    listNo: genCode("HZ", i),
    listType: pick(["in", "out"]),
    supervisionMode: pick(["1210", "1233", "5034", "1239"]),
    bizNo: genCode(pick(["IN", "IN", "OUT", "OUT", "XD"]), i),
    ledgerNo: pick(ledgerNoPool),
    packCount: randInt(10, 500),
    grossWeight: randInt(200, 8000),
    netWeight: 0,
    status,
    declareTime: declared ? pastTime(randInt(1, 8)) : undefined,
    declareBy: declared ? pick(["张报关", "李关务", "王申报"]) : undefined,
    refusedReason: status === "refused" ? pick(refusedReasons) : undefined,
    goods,
    remark: ""
  };
}).map(row => ({ ...row, netWeight: Math.round(row.grossWeight * 0.86) }));

const verifyNoPool = verifyLists.map(v => v.listNo);

// ========================= 核放单 =========================

const vehiclePool = [
  "沪AD5127",
  "沪BD9031",
  "沪CD1288",
  "粤BD3321",
  "川AD7788",
  "沪AD666K",
  "苏ED1289",
  "沪BD818N"
];
const driverPool = ["张伟", "李强", "王建军", "赵永刚", "刘志明", "陈国华"];
const containerPool = [
  "TCLU9012345",
  "TEMU4567890",
  "CSQU1234567",
  "MSKU7654321"
];

const releaseStatuses = [
  "crossed",
  "crossed",
  "crossed",
  "released",
  "released",
  "declared",
  "declared",
  "draft",
  "draft",
  "cancelled"
];

const releasePasses = genRows(24, i => {
  const status = pick(releaseStatuses);
  const declared = status !== "draft";
  const released = ["released", "crossed"].includes(status);
  const crossed = status === "crossed";
  return {
    id: i,
    passNo: genCode("HF", i),
    direction: pick(["in", "out"]),
    vehicleNo: pick(vehiclePool),
    driverName: pick(driverPool),
    driverPhone: `13${randInt(0, 9)}${String(randInt(10000000, 99999999))}`,
    containerNo: randInt(0, 1) ? pick(containerPool) : undefined,
    listNo: pick(verifyNoPool),
    bizNo: genCode(pick(["IN", "OUT"]), i),
    packCount: randInt(10, 480),
    grossWeight: randInt(200, 7800),
    status,
    declareTime: declared ? pastTime(randInt(1, 8)) : undefined,
    releaseTime: released ? pastTime(randInt(0, 4)) : undefined,
    crossTime: crossed ? pastTime(0) : undefined,
    remark: ""
  };
});

const passNoPool = releasePasses.map(r => r.passNo);

// ========================= 三单对碰 =========================

const platformPool = ["tmall", "jd", "pdd", "douyin", "kaola"];
const platformPrefix: Record<string, string> = {
  tmall: "TM",
  jd: "JD",
  pdd: "PDD",
  douyin: "DY",
  kaola: "KL"
};
const consigneePool = [
  "王*丽",
  "张*涛",
  "李*婷",
  "刘*明",
  "陈*静",
  "杨*帆",
  "赵*磊",
  "黄*欣"
];
const carrierPool = ["SF", "YT", "ZTO", "EMS", "JDL"];

const tripleFailReasons = [
  "支付单金额与订单金额不一致（差异 ¥12.00），请核对后重新推送",
  "收件人身份证信息缺失，无法完成实名认证对碰",
  "运单号与订单收件地址不匹配，退回修改",
  "电商平台订单编号不存在或已取消，对碰失败"
];

const tripleDocs: any[] = [];
let sdSeq = 0;
for (let g = 1; g <= 16; g++) {
  const platform = pick(platformPool);
  const orderNo = genCode(platformPrefix[platform], g);
  const consignee = pick(consigneePool);
  const amount = randInt(89, 2999) + randInt(0, 99) / 100;
  const groupStatus = pick([
    ["matched", "matched", "matched"],
    ["matched", "matched", "matched"],
    ["matched", "matched", "matched"],
    ["pending", "pending", "pending"],
    ["failed", "pending", "pending"],
    ["pushed", "pushed", "pushed"]
  ]);
  const pushed = groupStatus[0] !== "pending";
  const matched = groupStatus[0] === "matched";
  const pushTime = pushed ? pastTime(randInt(0, 6)) : undefined;
  const matchTime = matched ? pastTime(randInt(0, 4)) : undefined;
  const failReason =
    groupStatus[0] === "failed" ? pick(tripleFailReasons) : undefined;

  const defs: Array<[string, string, number]> = [
    ["order", orderNo, amount],
    ["payment", `PAY${randInt(100000, 999999)}${randInt(10, 99)}`, amount],
    ["logistics", `${pick(carrierPool)}${randInt(10000000, 99999999)}`, 0]
  ];
  defs.forEach(([docType, extNo, amt], idx) => {
    sdSeq += 1;
    tripleDocs.push({
      id: sdSeq,
      docNo: genCode("SD", sdSeq),
      docType,
      platform,
      orderNo,
      extNo,
      amount: amt,
      consignee,
      status: groupStatus[idx],
      failReason: docType === "order" ? failReason : undefined,
      pushTime,
      matchTime,
      createdAt: pushTime ?? pastTime(randInt(1, 10))
    });
  });
}

const tripleNoPool = tripleDocs.map(t => t.docNo);

// ========================= 海关报文日志 =========================

const msgTypePool = [
  "verify",
  "release",
  "triple",
  "triple",
  "summary",
  "ledger"
];
const failMsgs = [
  "海关返回错误：企业备案信息过期，请更新备案后重新申报（回执码 E1204）",
  "报文格式校验失败：缺少必填节点 goodsList.gNo（XSD 校验未通过）",
  "通道连接超时：单一窗口网关 60 秒未响应，请稍后重发",
  "对碰失败：支付单金额与订单金额不一致（差异 ¥12.00）"
];

function bizNoByType(msgType: string): string {
  if (msgType === "verify") return pick(verifyNoPool);
  if (msgType === "release") return pick(passNoPool);
  if (msgType === "triple") return pick(tripleNoPool);
  if (msgType === "summary") return `SUM${pickDate(30, 1).split("-").join("")}`;
  return pick(ledgerNoPool);
}

function channelByType(msgType: string): string {
  if (msgType === "triple" || msgType === "summary") return "ceb_platform";
  if (msgType === "release") return pick(["golden_phase2", "single_window"]);
  return pick(["golden_phase2", "single_window", "single_window"]);
}

function msgBody(msgType: string, bizNo: string): string {
  const base = {
    version: "1.0",
    messageId: bizNo,
    sendTime: pastTime(randInt(1, 7))
  };
  if (msgType === "verify")
    return JSON.stringify({
      ...base,
      messageType: "BondedVerifyDeclare",
      listNo: bizNo,
      ieFlag: pick(["I", "E"]),
      goodsCount: randInt(3, 5)
    });
  if (msgType === "release")
    return JSON.stringify({
      ...base,
      messageType: "PassPortDeclare",
      passNo: bizNo,
      vehicleNo: pick(vehiclePool)
    });
  if (msgType === "triple")
    return JSON.stringify({
      ...base,
      messageType: "CEB311Message",
      docNo: bizNo,
      platform: pick(platformPool)
    });
  if (msgType === "summary")
    return JSON.stringify({
      ...base,
      messageType: "SummaryApply",
      period: pickDate(60, 1).slice(0, 7),
      listCount: randInt(20, 300)
    });
  return JSON.stringify({
    ...base,
    messageType: "LedgerRegister",
    ledgerNo: bizNo
  });
}

function msgReceipt(msgType: string): string {
  const codes: Record<string, string> = {
    verify: "CBOP120000",
    release: "E0000",
    triple: "CBOP430000",
    summary: "CBOP450000",
    ledger: "CBOP110000"
  };
  const type = msgType === "triple" ? "CEBReceipt" : "CustomsReceipt";
  return JSON.stringify({
    receiptCode: codes[msgType],
    receiptMsg: msgType === "triple" ? "三单对碰成功" : "申报成功",
    messageType: type,
    receiptTime: pastTime(randInt(0, 5))
  });
}

const msgLogs = genRows(60, i => {
  const msgType = pick(msgTypePool);
  const bizNo = bizNoByType(msgType);
  const status = pick([
    "success",
    "success",
    "success",
    "success",
    "success",
    "success",
    "success",
    "fail",
    "pending",
    "resend"
  ]);
  const failed = status === "fail";
  const hasReceipt = status === "success";
  return {
    id: i,
    msgNo: genCode("MSG", i),
    msgType,
    channel: channelByType(msgType),
    direction: hasReceipt ? pick(["up", "down"]) : "up",
    bizNo,
    status,
    resendCount:
      status === "fail"
        ? randInt(0, 2)
        : status === "resend"
          ? randInt(1, 3)
          : 0,
    errorMsg: failed || status === "resend" ? pick(failMsgs) : undefined,
    content: msgBody(msgType, bizNo),
    response: hasReceipt ? msgReceipt(msgType) : undefined,
    createdAt: pastTime(randInt(1, 7))
  };
});

// ========================= 报文联动写入 =========================

/** 业务动作后追加一条上行报文日志 */
function addMsgLog(msgType: string, bizNo: string, status = "success") {
  msgLogs.unshift({
    id: Date.now(),
    msgNo: genCode("MSG", msgLogs.length + 1),
    msgType,
    channel: channelByType(msgType),
    direction: "up",
    bizNo,
    status,
    resendCount: 0,
    errorMsg: status === "success" ? undefined : pick(failMsgs),
    content: msgBody(msgType, bizNo),
    response: status === "success" ? msgReceipt(msgType) : undefined,
    createdAt: nowStr()
  });
}

// ========================= 路由 =========================

export default defineFakeRoute([
  // 账册：标准 CRUD
  ...crudRoutes({
    prefix: "/wms/customs/ledger",
    seed: ledgers,
    searchFields: ["ledgerNo", "enterpriseName", "customsCode"]
  }),

  // 核注清单：page/detail + 申报/回执（状态流转需操作 page 接口读取的同一份行对象，手工实现）
  {
    url: "/wms/customs/verifylist/page",
    method: "get",
    response: ({ query }) =>
      paginate(
        filterList(verifyLists, query, ["listNo", "bizNo", "ledgerNo"]),
        query
      )
  },
  {
    url: "/wms/customs/verifylist/detail",
    method: "get",
    response: ({ query }) => {
      const row = verifyLists.find(v => v.id === Number(query.id));
      return row ? ok(row) : fail("记录不存在");
    }
  },
  {
    url: "/wms/customs/verifylist/declare",
    method: "post",
    response: ({ body }) => {
      const row = verifyLists.find(v => v.id === body?.id);
      if (!row) return fail("清单不存在");
      if (!["draft", "refused"].includes(row.status))
        return fail("仅草稿/退单状态可申报");
      row.status = "declared";
      row.declareTime = nowStr();
      row.declareBy = "张报关";
      row.refusedReason = undefined;
      addMsgLog("verify", row.listNo);
      return ok(true, "申报成功");
    }
  },
  {
    url: "/wms/customs/verifylist/sync-receipt",
    method: "post",
    response: ({ body }) => {
      const row = verifyLists.find(v => v.id === body?.id);
      if (!row) return fail("清单不存在");
      if (row.status === "declared") {
        row.status = "passed";
      } else if (row.status === "passed") {
        row.status = "deducted";
      } else {
        return fail("当前状态无回执可同步");
      }
      addMsgLog("verify", row.listNo, "success");
      return ok(true, "回执同步成功");
    }
  },

  // 核放单：page/detail + 申报/放行/过卡/作废
  {
    url: "/wms/customs/release/page",
    method: "get",
    response: ({ query }) =>
      paginate(
        filterList(releasePasses, query, [
          "passNo",
          "vehicleNo",
          "listNo",
          "bizNo"
        ]),
        query
      )
  },
  {
    url: "/wms/customs/release/detail",
    method: "get",
    response: ({ query }) => {
      const row = releasePasses.find(r => r.id === Number(query.id));
      return row ? ok(row) : fail("记录不存在");
    }
  },
  {
    url: "/wms/customs/release/declare",
    method: "post",
    response: ({ body }) => {
      const row = releasePasses.find(r => r.id === body?.id);
      if (!row) return fail("核放单不存在");
      if (row.status !== "draft") return fail("仅待申报状态可申报");
      row.status = "declared";
      row.declareTime = nowStr();
      addMsgLog("release", row.passNo);
      return ok(true, "申报成功");
    }
  },
  {
    url: "/wms/customs/release/release",
    method: "post",
    response: ({ body }) => {
      const row = releasePasses.find(r => r.id === body?.id);
      if (!row) return fail("核放单不存在");
      if (row.status !== "declared") return fail("仅已申报状态可放行");
      row.status = "released";
      row.releaseTime = nowStr();
      addMsgLog("release", row.passNo, "success");
      return ok(true, "海关已放行");
    }
  },
  {
    url: "/wms/customs/release/cross",
    method: "post",
    response: ({ body }) => {
      const row = releasePasses.find(r => r.id === body?.id);
      if (!row) return fail("核放单不存在");
      if (row.status !== "released") return fail("仅已放行状态可过卡确认");
      row.status = "crossed";
      row.crossTime = nowStr();
      return ok(true, "过卡登记完成");
    }
  },
  {
    url: "/wms/customs/release/cancel",
    method: "post",
    response: ({ body }) => {
      const row = releasePasses.find(r => r.id === body?.id);
      if (!row) return fail("核放单不存在");
      if (!["draft", "declared"].includes(row.status))
        return fail("仅待申报/已申报状态可作废");
      row.status = "cancelled";
      return ok(true, "已作废");
    }
  },

  // 三单：page/detail + 推送
  {
    url: "/wms/customs/tripledoc/page",
    method: "get",
    response: ({ query }) =>
      paginate(
        filterList(tripleDocs, query, ["docNo", "orderNo", "extNo"]),
        query
      )
  },
  {
    url: "/wms/customs/tripledoc/detail",
    method: "get",
    response: ({ query }) => {
      const row = tripleDocs.find(t => t.id === Number(query.id));
      return row ? ok(row) : fail("记录不存在");
    }
  },
  {
    url: "/wms/customs/tripledoc/push",
    method: "post",
    response: ({ body }) => {
      const row = tripleDocs.find(t => t.id === body?.id);
      if (!row) return fail("单证不存在");
      if (!["pending", "failed"].includes(row.status))
        return fail("仅待推送/对碰失败状态可推送");
      row.status = "matched";
      row.failReason = undefined;
      row.pushTime = nowStr();
      row.matchTime = nowStr();
      addMsgLog("triple", row.docNo);
      return ok(true, "推送成功，海关对碰通过");
    }
  },

  // 报文：page/detail + 重发
  {
    url: "/wms/customs/msglog/page",
    method: "get",
    response: ({ query }) =>
      paginate(filterList(msgLogs, query, ["msgNo", "bizNo"]), query)
  },
  {
    url: "/wms/customs/msglog/detail",
    method: "get",
    response: ({ query }) => {
      const row = msgLogs.find(m => m.id === Number(query.id));
      return row ? ok(row) : fail("记录不存在");
    }
  },
  {
    url: "/wms/customs/msglog/resend",
    method: "post",
    response: ({ body }) => {
      const row = msgLogs.find(m => m.id === body?.id);
      if (!row) return fail("报文不存在");
      if (!["fail", "resend"].includes(row.status))
        return fail("仅失败报文可重发");
      row.status = "success";
      row.resendCount += 1;
      row.errorMsg = undefined;
      row.response = msgReceipt(row.msgType);
      row.createdAt = nowStr();
      return ok(true, "重发成功");
    }
  }
]);

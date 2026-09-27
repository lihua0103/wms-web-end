import { defineFakeRoute } from "vite-plugin-fake-server/client";
import {
  ok,
  fail,
  filterList,
  paginate,
  genRows,
  pick,
  randInt,
  nowStr,
  genCode
} from "./_db";

/**
 * 智能体模块 mock：
 * 注意：工作流「运行/启停」与运行记录「重试」需要跨端点同步状态，
 * 因此不使用 crudRoutes（其内部深拷贝种子会导致状态不一致），统一手写端点。
 */

// ========================= 工作流种子（预置 6 条，见需求文档 FR-6） =========================

const step = (name: string, type: string) => ({ name, type });

const workflowSeeds = [
  {
    code: "WF-AI-001",
    name: "库存预警智能处置",
    scene: "inventory",
    triggerType: "event",
    cronExpr: "",
    model: "glm-4.7",
    status: "enabled",
    description: "库存预警产生时自动识别类型、核对安全库存并生成补货工单",
    steps: [
      step("识别预警类型", "llm"),
      step("检查安全库存", "tool"),
      step("生成补货建议", "llm"),
      step("创建补货工单", "tool")
    ],
    runCount: 128,
    successRate: 96
  },
  {
    code: "WF-AI-002",
    name: "在途延误主动跟进",
    scene: "transport",
    triggerType: "scheduled",
    cronExpr: "0 */30 * * * ?",
    model: "glm-4.7",
    status: "enabled",
    description:
      "每 30 分钟扫描在途配送单，识别延误并通知承运商升级、更新客户交期",
    steps: [
      step("拉取在途配送单", "tool"),
      step("延误识别", "llm"),
      step("承运商升级通知", "tool"),
      step("更新客户交期", "llm")
    ],
    runCount: 2140,
    successRate: 99
  },
  {
    code: "WF-AI-003",
    name: "国际单证智能审核",
    scene: "customs",
    triggerType: "manual",
    cronExpr: "",
    model: "glm-4.7",
    status: "enabled",
    description: "OCR 解析出口单证，校验要素完整性并做 HS 编码预归类与风险标记",
    steps: [
      step("OCR 解析单证", "tool"),
      step("要素完整性校验", "llm"),
      step("HS 编码预归类", "tool"),
      step("风险标记与人工复核", "llm")
    ],
    runCount: 356,
    successRate: 92
  },
  {
    code: "WF-AI-004",
    name: "运费智能对账",
    scene: "billing",
    triggerType: "scheduled",
    cronExpr: "0 0 2 * * ?",
    model: "deepseek-v3.2",
    status: "enabled",
    description:
      "每日 02:00 拉取账单与运单做费用明细匹配，差异分类并生成对账报告",
    steps: [
      step("拉取账单与运单", "tool"),
      step("费用明细匹配", "llm"),
      step("差异分类", "tool"),
      step("生成对账报告", "llm")
    ],
    runCount: 87,
    successRate: 88
  },
  {
    code: "WF-AI-005",
    name: "智能补货建议",
    scene: "inventory",
    triggerType: "scheduled",
    cronExpr: "0 0 6 ? * MON",
    model: "glm-4.5-air",
    status: "disabled",
    description: "每周一 06:00 分析销量与库存，测算补货量并生成补货计划",
    steps: [
      step("销量与库存分析", "tool"),
      step("补货量测算", "llm"),
      step("生成补货计划", "tool")
    ],
    runCount: 42,
    successRate: 95
  },
  {
    code: "WF-AI-006",
    name: "越库调度建议",
    scene: "operation",
    triggerType: "event",
    cronExpr: "",
    model: "qwen3-max",
    status: "enabled",
    description: "入库预约到达时做供需匹配分析，评估越库可行性并生成调度方案",
    steps: [
      step("供需匹配分析", "tool"),
      step("越库可行性评估", "llm"),
      step("生成调度方案", "tool")
    ],
    runCount: 233,
    successRate: 94
  }
];

const workflows: any[] = workflowSeeds.map((wf, idx) => ({
  id: idx + 1,
  ...wf,
  lastRunAt: wf.status === "enabled" ? nowStr() : undefined,
  updatedAt: nowStr()
}));

let nextWorkflowId = workflows.reduce((m, r) => Math.max(m, r.id), 0) + 1;

// ========================= 运行记录种子 =========================

/** 各工作流的步骤输入输出话术（详情时间线展示用） */
const stepIo: Record<string, Array<{ input: string; output: string }>> = {
  "WF-AI-001": [
    { input: "预警事件 W2026…", output: "类型=低于安全库存，SKU=SKU00017" },
    { input: "warehouse=WH002", output: "可用 0 件 / 安全线 500 件" },
    { input: "根因+在途+订单影响", output: "建议加急补货 300 件" },
    { input: "补货建议 JSON", output: "工单 RP2026… 已创建" }
  ],
  "WF-AI-002": [
    { input: "时间窗=最近 30 分钟", output: "在途配送单 38 单" },
    { input: "38 单轨迹与承诺时效", output: "识别延误 2 单（>30min）" },
    { input: "延误单号+承运商", output: "升级通知已发送（2/2）" },
    { input: "新 ETA", output: "客户交期已更新" }
  ],
  "WF-AI-003": [
    { input: "单证 PDF ×3", output: "提取要素 18 项" },
    { input: "要素清单", output: "16 项通过，2 项待确认" },
    { input: "品名=精密轴承", output: "HS 8482.10，置信度 0.94" },
    { input: "校验结果+归类", output: "风险=中，转人工复核" }
  ],
  "WF-AI-004": [
    { input: "账期=昨日", output: "账单 12 张 / 运单 1,286 单" },
    { input: "费用明细 ×2 侧", output: "匹配 1,241 单，差异 45 单" },
    { input: "差异 45 单", output: "费率差 28 / 重量差 12 / 重复计费 5" },
    { input: "差异分类结果", output: "对账报告 BILL-RP-… 已生成" }
  ],
  "WF-AI-005": [
    { input: "近 8 周销量+当前库存", output: "39 个 SKU 低于建议水位" },
    { input: "预测+前置期", output: "补货量 1.2 万件，金额 ¥86 万" },
    { input: "补货量清单", output: "补货计划 3 份待审批" }
  ],
  "WF-AI-006": [
    { input: "ASN2026… 到货明细", output: "匹配出库需求 7 单" },
    { input: "供需匹配矩阵", output: "可越库 5 单，节省上架 62%" },
    { input: "越库方案", output: "调度方案 XD2026… 已生成" }
  ]
};

const errorMessages: Record<string, string> = {
  "WF-AI-001": "补货工单创建失败：货主额度校验接口超时（HTTP 504）",
  "WF-AI-002": "承运商通知失败：短信通道返回限流错误码 105",
  "WF-AI-003": "OCR 解析失败：扫描件分辨率过低（120dpi），需人工重传",
  "WF-AI-004": "账单拉取失败：TMS 侧账期文件未就绪，已自动顺延",
  "WF-AI-005": "销量预测接口鉴权失败：access_token 过期",
  "WF-AI-006": "供需匹配失败：物料主数据缺少体积字段（SKU00031）"
};

/** 按运行状态生成步骤明细 */
function buildSteps(workflowCode: string, status: string, stepTotal: number) {
  const wf = workflows.find(w => w.code === workflowCode);
  const io = stepIo[workflowCode] ?? [];
  const template = wf?.steps ?? [];
  const stepDone =
    status === "success"
      ? stepTotal
      : status === "failed"
        ? randInt(1, stepTotal - 1)
        : randInt(1, stepTotal - 1);
  return template.map((s, i) => {
    let st = "success";
    if (status === "failed") {
      st = i < stepDone ? "success" : i === stepDone ? "failed" : "skipped";
    } else if (status === "running") {
      st = i < stepDone ? "success" : i === stepDone ? "running" : "pending";
    }
    return {
      id: i + 1,
      name: s.name,
      type: s.type,
      status: st,
      duration: st === "pending" || st === "skipped" ? 0 : randInt(120, 2600),
      input: io[i]?.input ?? "—",
      output:
        st === "success"
          ? (io[i]?.output ?? "—")
          : st === "failed"
            ? "执行异常"
            : "—"
    };
  });
}

function minutesAgoStr(min: number): string {
  const d = new Date(Date.now() - min * 60000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const runs = genRows(64, i => {
  const wf = pick(workflows);
  const status = pick([
    "success",
    "success",
    "success",
    "success",
    "success",
    "success",
    "failed",
    "running"
  ]);
  const stepTotal = wf.steps.length;
  const startedAgo = randInt(5, 72 * 60);
  const duration =
    status === "running" ? randInt(800, 4200) : randInt(2400, 26000);
  return {
    id: i,
    runNo: genCode("RUN", i),
    workflowCode: wf.code,
    workflowName: wf.name,
    scene: wf.scene,
    triggerType: wf.triggerType,
    status,
    stepDone:
      status === "success"
        ? stepTotal
        : status === "failed"
          ? randInt(1, stepTotal - 1)
          : randInt(1, stepTotal - 1),
    stepTotal,
    duration,
    tokens: randInt(320, 4200),
    operator:
      wf.triggerType === "manual"
        ? pick(["admin", "李仓管", "王主管"])
        : wf.triggerType === "scheduled"
          ? "scheduler"
          : "event-engine",
    startedAt: minutesAgoStr(startedAgo),
    finishedAt:
      status === "running" ? undefined : minutesAgoStr(startedAgo - 1),
    errorMsg: status === "failed" ? errorMessages[wf.code] : undefined
  };
});

// 详情步骤按需生成并缓存（避免种子期全量构建）
const stepCache = new Map<number, any[]>();
function getRunSteps(run: any) {
  if (!stepCache.has(run.id)) {
    stepCache.set(
      run.id,
      buildSteps(run.workflowCode, run.status, run.stepTotal)
    );
  }
  return stepCache.get(run.id);
}

let nextRunId = runs.reduce((m, r) => Math.max(m, r.id), 0) + 1;

/** 创建一次运行并异步推进到终态（演示状态流转） */
function startRun(wf: any, operator: string) {
  const status =
    Math.random() < 0.15
      ? "running"
      : Math.random() < 0.12
        ? "failed"
        : "success";
  const run = {
    id: nextRunId++,
    runNo: genCode("RUN", nextRunId),
    workflowCode: wf.code,
    workflowName: wf.name,
    scene: wf.scene,
    triggerType: "manual",
    status: "running",
    stepDone: 0,
    stepTotal: wf.steps.length,
    duration: 0,
    tokens: 0,
    operator,
    startedAt: nowStr(),
    finishedAt: undefined,
    errorMsg: undefined
  };
  runs.unshift(run);
  wf.runCount += 1;
  wf.lastRunAt = nowStr();
  // 逐步推进：每步 0.8s，运行中记录在列表轮询/刷新时可见状态变化
  let done = 0;
  const timer = setInterval(() => {
    done += 1;
    run.stepDone = done;
    if (done >= run.stepTotal) {
      clearInterval(timer);
      run.status = status === "running" ? "success" : status;
      run.duration = randInt(2400, 18000);
      run.tokens = randInt(320, 3600);
      run.finishedAt = nowStr();
      run.errorMsg =
        run.status === "failed" ? errorMessages[wf.code] : undefined;
      stepCache.delete(run.id);
    }
  }, 800);
  return run;
}

// ========================= 路由 =========================

export default defineFakeRoute([
  // ---- 工作流管理（手写 CRUD，与运行/启停共享同一数组） ----
  {
    url: "/wms/ai/workflow/page",
    method: "get",
    response: ({ query }) =>
      paginate(
        filterList(workflows, query, ["code", "name", "description"]),
        query
      )
  },
  {
    url: "/wms/ai/workflow/detail",
    method: "get",
    response: ({ query }) => {
      const row = workflows.find(w => String(w.id) === String(query.id));
      return row ? ok(row) : fail("工作流不存在");
    }
  },
  {
    url: "/wms/ai/workflow/add",
    method: "post",
    response: ({ body }) => {
      const row = {
        ...body,
        id: nextWorkflowId++,
        runCount: 0,
        successRate: 100,
        lastRunAt: undefined,
        updatedAt: nowStr()
      };
      workflows.unshift(row);
      return ok(row, "新增成功");
    }
  },
  {
    url: "/wms/ai/workflow/update",
    method: "post",
    response: ({ body }) => {
      const row = workflows.find(w => String(w.id) === String(body?.id));
      if (!row) return fail("工作流不存在");
      Object.assign(row, body, { updatedAt: nowStr() });
      return ok(row, "更新成功");
    }
  },
  {
    url: "/wms/ai/workflow/delete",
    method: "post",
    response: ({ body }) => {
      const ids: any[] = body?.ids ?? [];
      const idx = workflows.findIndex(w =>
        ids.some(id => String(id) === String(w.id))
      );
      if (idx < 0) return fail("工作流不存在");
      workflows.splice(idx, 1);
      return ok(true, "删除成功");
    }
  },
  // 工作流启停
  {
    url: "/wms/ai/workflow/toggle",
    method: "post",
    response: ({ body }) => {
      const row = workflows.find(w => String(w.id) === String(body?.id));
      if (!row) return fail("工作流不存在");
      row.status = body?.enable ? "enabled" : "disabled";
      return ok(true, body?.enable ? "工作流已启用" : "工作流已停用");
    }
  },
  // 手动触发运行
  {
    url: "/wms/ai/workflow/run",
    method: "post",
    response: ({ body }) => {
      const row = workflows.find(w => String(w.id) === String(body?.id));
      if (!row) return fail("工作流不存在");
      if (row.status !== "enabled") return fail("工作流已停用，请先启用");
      const run = startRun(row, "admin");
      return ok(run, "已触发运行，可前往运行记录查看进度");
    }
  },
  // ---- 运行记录 ----
  {
    url: "/wms/ai/run/page",
    method: "get",
    response: ({ query }) =>
      paginate(
        filterList(runs, query, ["runNo", "workflowName", "workflowCode"]),
        query
      )
  },
  {
    url: "/wms/ai/run/detail",
    method: "get",
    response: ({ query }) => {
      const row = runs.find(r => String(r.id) === String(query.id));
      if (!row) return fail("运行记录不存在");
      return ok({ ...row, steps: getRunSteps(row) });
    }
  },
  // 失败重试
  {
    url: "/wms/ai/run/retry",
    method: "post",
    response: ({ body }) => {
      const row = runs.find(r => String(r.id) === String(body?.id));
      if (!row) return fail("运行记录不存在");
      if (row.status === "running") return fail("运行中记录不可重试");
      const wf = workflows.find(w => w.code === row.workflowCode);
      if (!wf) return fail("原工作流已删除，无法重试");
      const run = startRun(wf, "admin");
      return ok(run, `已重新入队，新运行编号 ${run.runNo}`);
    }
  }
]);

/**
 * 智能体模块 API（工作流管理 / 运行记录 / Copilot 会话流）
 *
 * 会话流协议见 docs/智能体工作流需求说明.md §5.2：
 * - AiEndpoint 配置了远端网关时走真实 SSE（fetch + ReadableStream 解析）
 * - 未配置 / 请求失败时自动降级为本地预览引擎（同一事件契约），支撑演示与联调
 */
import { http } from "@/utils/http";
import { getConfig } from "@/config";
import { $t } from "@/plugins/i18n";
import type { ApiResult, PageQuery, PageResult } from "./types";

// ========================= 类型定义 =========================

/** 工作流编排步骤 */
export interface AiWorkflowStep {
  /** 步骤名称，如「识别预警类型」 */
  name: string;
  /** 节点类型 start/llm/tool/condition/end */
  type: string;
}

/** 智能体工作流 */
export interface AiWorkflowItem {
  id: number;
  /** 工作流编码，前缀 WF-AI */
  code: string;
  /** 工作流名称 */
  name: string;
  /** 业务场景 inventory/operation/transport/billing/customs/report */
  scene: string;
  /** 触发方式 manual/scheduled/event */
  triggerType: string;
  /** 定时表达式（scheduled 时展示用） */
  cronExpr?: string;
  /** 执行模型 */
  model: string;
  /** enabled/disabled */
  status: string;
  /** 工作流说明 */
  description?: string;
  /** 编排步骤 */
  steps: AiWorkflowStep[];
  /** 累计运行次数 */
  runCount: number;
  /** 成功率（0-100） */
  successRate: number;
  /** 最近运行时间 */
  lastRunAt?: string;
  updatedAt?: string;
}

/** 运行步骤明细 */
export interface AiRunStepItem {
  id: number;
  /** 步骤名称 */
  name: string;
  /** 节点类型 start/llm/tool/condition/end */
  type: string;
  /** running/success/failed/skipped */
  status: string;
  /** 耗时（毫秒） */
  duration: number;
  /** 输入摘要 */
  input?: string;
  /** 输出摘要 */
  output?: string;
}

/** 智能体运行记录 */
export interface AiRunItem {
  id: number;
  /** 运行编号，前缀 RUN */
  runNo: string;
  workflowCode: string;
  workflowName: string;
  /** 业务场景 */
  scene: string;
  /** 触发方式 */
  triggerType: string;
  /** running/success/failed */
  status: string;
  /** 步骤进度，如 4/4 */
  stepDone: number;
  stepTotal: number;
  /** 总耗时（毫秒） */
  duration: number;
  /** Token 消耗 */
  tokens: number;
  /** 触发者（用户 / 调度器 / 事件） */
  operator: string;
  startedAt?: string;
  finishedAt?: string;
  errorMsg?: string;
  /** 详情接口返回的步骤明细 */
  steps?: AiRunStepItem[];
}

// ========================= 工作流管理 =========================

export const getAiWorkflowPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<AiWorkflowItem>>>(
    "get",
    "/wms/ai/workflow/page",
    { params }
  );

export const addAiWorkflow = (data: Partial<AiWorkflowItem>) =>
  http.request<ApiResult<AiWorkflowItem>>("post", "/wms/ai/workflow/add", {
    data
  });

export const updateAiWorkflow = (data: Partial<AiWorkflowItem>) =>
  http.request<ApiResult<AiWorkflowItem>>("post", "/wms/ai/workflow/update", {
    data
  });

export const deleteAiWorkflow = (ids: number[]) =>
  http.request<ApiResult<boolean>>("post", "/wms/ai/workflow/delete", {
    data: { ids }
  });

/** 工作流启停 */
export const toggleAiWorkflow = (id: number, enable: boolean) =>
  http.request<ApiResult<boolean>>("post", "/wms/ai/workflow/toggle", {
    data: { id, enable }
  });

/** 手动触发一次运行 */
export const runAiWorkflow = (id: number) =>
  http.request<ApiResult<AiRunItem>>("post", "/wms/ai/workflow/run", {
    data: { id }
  });

// ========================= 运行记录 =========================

export const getAiRunPage = (params?: PageQuery) =>
  http.request<ApiResult<PageResult<AiRunItem>>>("get", "/wms/ai/run/page", {
    params
  });

export const getAiRunDetail = (id: number) =>
  http.request<ApiResult<AiRunItem>>("get", "/wms/ai/run/detail", {
    params: { id }
  });

/** 失败重试 */
export const retryAiRun = (id: number) =>
  http.request<ApiResult<boolean>>("post", "/wms/ai/run/retry", {
    data: { id }
  });

// ========================= 会话流（SSE 协议契约） =========================

export type AgentChatRole = "user" | "assistant";

/** 会话轮次（发给引擎的历史上下文） */
export interface AgentChatTurn {
  role: AgentChatRole;
  content: string;
}

/** SSE 事件：思考摘要 */
interface AgentThoughtEvent {
  type: "thought";
  text: string;
}

/** SSE 事件：工具调用发起 */
interface AgentToolCallEvent {
  type: "tool_call";
  id: string;
  name: string;
  args: Record<string, unknown>;
}

/** SSE 事件：工具返回 */
interface AgentToolResultEvent {
  type: "tool_result";
  id: string;
  name: string;
  summary: string;
  ms: number;
}

/** SSE 事件：工作流步骤推进 */
interface AgentStepEvent {
  type: "step";
  key: string;
  title: string;
  status: "running" | "success" | "failed";
}

/** SSE 事件：正文增量 */
interface AgentDeltaEvent {
  type: "delta";
  text: string;
}

/** SSE 事件：结束 */
interface AgentDoneEvent {
  type: "done";
  usage: { tokens: number };
  suggestions: string[];
}

/** SSE 事件：异常 */
interface AgentErrorEvent {
  type: "error";
  message: string;
}

export type AgentEvent =
  | AgentThoughtEvent
  | AgentToolCallEvent
  | AgentToolResultEvent
  | AgentStepEvent
  | AgentDeltaEvent
  | AgentDoneEvent
  | AgentErrorEvent;

/** 会话流回调（前端按需消费事件） */
export interface AgentStreamHandlers {
  onThought?: (text: string) => void;
  onToolCall?: (e: AgentToolCallEvent) => void;
  onToolResult?: (e: AgentToolResultEvent) => void;
  onStep?: (e: AgentStepEvent) => void;
  onDelta?: (text: string) => void;
  onDone?: (e: AgentDoneEvent) => void;
  onError?: (message: string) => void;
}

/** 引擎模式：远端网关 / 本地预览 / 功能关闭 */
export type AgentEngineMode = "remote" | "local" | "off";

/** 当前引擎模式（依据 platform-config.json） */
export function getAgentEngineMode(): AgentEngineMode {
  if ((getConfig("AiEnabled") as unknown as boolean) === false) return "off";
  return getConfig("AiEndpoint") ? "remote" : "local";
}

let sessionId = `sess-${Date.now().toString(36)}`;

/** 重置会话（清空会话时调用） */
export function resetAgentSession() {
  sessionId = `sess-${Date.now().toString(36)}`;
}

function dispatch(event: AgentEvent, handlers: AgentStreamHandlers) {
  switch (event.type) {
    case "thought":
      handlers.onThought?.(event.text);
      break;
    case "tool_call":
      handlers.onToolCall?.(event);
      break;
    case "tool_result":
      handlers.onToolResult?.(event);
      break;
    case "step":
      handlers.onStep?.(event);
      break;
    case "delta":
      handlers.onDelta?.(event.text);
      break;
    case "done":
      handlers.onDone?.(event);
      break;
    case "error":
      handlers.onError?.(event.message);
      break;
  }
}

/** Copilot 会话流入口：远端 SSE 优先，未配置/失败时降级本地预览引擎 */
export async function streamAgentChat(
  messages: AgentChatTurn[],
  handlers: AgentStreamHandlers,
  signal?: AbortSignal
) {
  const mode = getAgentEngineMode();
  if (mode === "off") {
    handlers.onError?.($t("ai.panel.preview.engineOff"));
    return;
  }
  if (mode === "remote") {
    try {
      await streamRemote(messages, handlers, signal);
      return;
    } catch (err) {
      if (signal?.aborted) return;
      handlers.onThought?.(
        $t("ai.panel.preview.remoteFallback", {
          msg: (err as Error).message
        })
      );
    }
  }
  await streamLocalPreview(messages, handlers, signal);
}

// ========================= 远端 SSE 客户端（原生 fetch，零依赖） =========================

async function streamRemote(
  messages: AgentChatTurn[],
  handlers: AgentStreamHandlers,
  signal?: AbortSignal
) {
  const endpoint = String(getConfig("AiEndpoint")).replace(/\/$/, "");
  const resp = await fetch(`${endpoint}/v1/agent/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream"
    },
    body: JSON.stringify({ sessionId, scene: "wms", messages }),
    signal
  });
  if (!resp.ok || !resp.body) {
    throw new Error(`HTTP ${resp.status}`);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const dataLine = block.split("\n").find(line => line.startsWith("data:"));
      if (!dataLine) continue;
      try {
        dispatch(JSON.parse(dataLine.slice(5).trim()), handlers);
      } catch {
        /* 忽略心跳等非 JSON 帧 */
      }
    }
  }
}

// ========================= 本地预览引擎 =========================

/** 意图路由结果：思考摘要 / 工具轨迹 / 工作流步骤 / 正文 / 追问建议 */
interface PreviewScript {
  thought: string;
  tools: Array<{
    name: string;
    args: Record<string, unknown>;
    summary: string;
    ms: number;
  }>;
  steps?: Array<{ key: string; title: string }>;
  body: string;
  suggestions: string[];
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    };
    if (signal?.aborted) return onAbort();
    signal?.addEventListener("abort", onAbort, { once: true });
  });

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** 从最近一条用户消息做关键词意图识别（中英文关键词均支持） */
function detectIntent(text: string): string {
  const t = text.toLowerCase();
  const has = (...ws: string[]) => ws.some(w => t.includes(w));
  if (has("处置", "处理", "解决方案", "生成工单", "solution", "how to fix"))
    return "exception_handle";
  if (
    has("运费", "试算", "报价", "多少钱", "价格", "freight", "quote", "price")
  )
    return "freight_quote";
  if (
    has(
      "时效",
      "送达",
      "eta",
      "延误",
      "在途",
      "到港",
      "arrive",
      "arrival",
      "delivery time",
      "delay"
    )
  )
    return "eta_query";
  if (
    has(
      "关务",
      "单证",
      "报关",
      "hs",
      "归类",
      "合规",
      "customs",
      "declaration",
      "compliance",
      "duty"
    )
  )
    return "customs_check";
  if (
    has(
      "异常",
      "预警",
      "缺货",
      "超时",
      "滞销",
      "风险",
      "exception",
      "alert",
      "stockout",
      "out of stock",
      "risk"
    )
  )
    return "exception_scan";
  if (
    has(
      "报表",
      "周报",
      "效率",
      "趋势",
      "kpi",
      "汇总",
      "report",
      "weekly",
      "summary",
      "trend"
    )
  )
    return "report_gen";
  if (
    has(
      "库存",
      "库位",
      "余量",
      "现货",
      "batch",
      "批次",
      "inventory",
      "stock",
      "on hand"
    )
  )
    return "inventory_query";
  if (
    has(
      "单据",
      "预约",
      "asn",
      "出库单",
      "进度",
      "拣货",
      "入库",
      "发货",
      "order",
      "appointment",
      "picking",
      "inbound",
      "outbound",
      "shipment",
      "document"
    )
  )
    return "doc_trace";
  return "general";
}

/** 各意图的剧本（数据口径与 mock/_db.ts、mock/inventory.ts 保持一致） */
function buildScript(intent: string, question: string): PreviewScript {
  switch (intent) {
    case "inventory_query":
      return {
        thought: $t("ai.panel.preview.inventory.thought"),
        tools: [
          {
            name: "query_inventory",
            args: { warehouse: "WH001", zone: ["A", "B"], top: 3 },
            summary: $t("ai.panel.preview.inventory.toolSummary"),
            ms: randInt(90, 260)
          }
        ],
        body: $t("ai.panel.preview.inventory.body"),
        suggestions: [
          $t("ai.panel.preview.inventory.s1"),
          $t("ai.panel.preview.inventory.s2"),
          $t("ai.panel.preview.inventory.s3")
        ]
      };
    case "doc_trace":
      return {
        thought: $t("ai.panel.preview.docTrace.thought"),
        tools: [
          {
            name: "trace_document",
            args: { docNo: "ASN202609260013", type: "asn" },
            summary: $t("ai.panel.preview.docTrace.toolSummary"),
            ms: randInt(120, 300)
          }
        ],
        body: $t("ai.panel.preview.docTrace.body"),
        suggestions: [
          $t("ai.panel.preview.docTrace.s1"),
          $t("ai.panel.preview.docTrace.s2"),
          $t("ai.panel.preview.docTrace.s3")
        ]
      };
    case "exception_scan": {
      const warnings = randInt(6, 11);
      return {
        thought: $t("ai.panel.preview.exceptionScan.thought"),
        tools: [
          {
            name: "scan_exceptions",
            args: { scope: ["stock", "task", "aging"], window: "today" },
            summary: $t("ai.panel.preview.exceptionScan.toolSummary", {
              count: warnings
            }),
            ms: randInt(150, 380)
          }
        ],
        steps: [
          {
            key: "detect",
            title: $t("ai.panel.preview.exceptionScan.step1")
          },
          {
            key: "classify",
            title: $t("ai.panel.preview.exceptionScan.step2")
          },
          { key: "rank", title: $t("ai.panel.preview.exceptionScan.step3") }
        ],
        body: $t("ai.panel.preview.exceptionScan.body", {
          count: warnings,
          slowCount: warnings - 2
        }),
        suggestions: [
          $t("ai.panel.preview.exceptionScan.s1"),
          $t("ai.panel.preview.exceptionScan.s2"),
          $t("ai.panel.preview.exceptionScan.s3")
        ]
      };
    }
    case "report_gen":
      return {
        thought: $t("ai.panel.preview.reportGen.thought"),
        tools: [
          {
            name: "aggregate_kpi",
            args: {
              range: "last7d",
              metrics: ["inout", "efficiency", "accuracy"]
            },
            summary: $t("ai.panel.preview.reportGen.toolSummary"),
            ms: randInt(200, 460)
          }
        ],
        body: $t("ai.panel.preview.reportGen.body"),
        suggestions: [
          $t("ai.panel.preview.reportGen.s1"),
          $t("ai.panel.preview.reportGen.s2"),
          $t("ai.panel.preview.reportGen.s3")
        ]
      };
    case "freight_quote":
      return {
        thought: $t("ai.panel.preview.freightQuote.thought"),
        tools: [
          {
            name: "freight_quote",
            args: {
              from: "CNSHA",
              to: "USLAX",
              pallets: 2,
              weight: 500,
              volume: 3.2
            },
            summary: $t("ai.panel.preview.freightQuote.toolSummary"),
            ms: randInt(220, 520)
          }
        ],
        body: $t("ai.panel.preview.freightQuote.body"),
        suggestions: [
          $t("ai.panel.preview.freightQuote.s1"),
          $t("ai.panel.preview.freightQuote.s2"),
          $t("ai.panel.preview.freightQuote.s3")
        ]
      };
    case "eta_query": {
      const delay = randInt(0, 2);
      return {
        thought: $t("ai.panel.preview.etaQuery.thought"),
        tools: [
          {
            name: "query_eta",
            args: { deliveryNo: "DP202609250008" },
            summary: $t("ai.panel.preview.etaQuery.toolSummary"),
            ms: randInt(140, 320)
          }
        ],
        body:
          delay === 0
            ? $t("ai.panel.preview.etaQuery.bodyOnTime")
            : $t("ai.panel.preview.etaQuery.bodyDelayed"),
        suggestions: [
          $t("ai.panel.preview.etaQuery.s1"),
          $t("ai.panel.preview.etaQuery.s2"),
          $t("ai.panel.preview.etaQuery.s3")
        ]
      };
    }
    case "customs_check":
      return {
        thought: $t("ai.panel.preview.customsCheck.thought"),
        tools: [
          {
            name: "ocr_document",
            args: { docType: "commercial_invoice", pages: 3 },
            summary: $t("ai.panel.preview.customsCheck.toolSummaryOcr"),
            ms: randInt(260, 600)
          },
          {
            name: "hs_classify",
            args: { goods: "精密轴承", material: "轴承钢" },
            summary: $t("ai.panel.preview.customsCheck.toolSummaryHs"),
            ms: randInt(180, 420)
          }
        ],
        steps: [
          {
            key: "ocr",
            title: $t("ai.panel.preview.customsCheck.stepOcr")
          },
          {
            key: "verify",
            title: $t("ai.panel.preview.customsCheck.stepVerify")
          },
          { key: "hs", title: $t("ai.panel.preview.customsCheck.stepHs") },
          {
            key: "risk",
            title: $t("ai.panel.preview.customsCheck.stepRisk")
          }
        ],
        body: $t("ai.panel.preview.customsCheck.body"),
        suggestions: [
          $t("ai.panel.preview.customsCheck.s1"),
          $t("ai.panel.preview.customsCheck.s2"),
          $t("ai.panel.preview.customsCheck.s3")
        ]
      };
    case "exception_handle": {
      const sku = "SKU00017";
      return {
        thought: $t("ai.panel.preview.exceptionHandle.thought", { sku }),
        tools: [
          {
            name: "analyze_root_cause",
            args: { warningId: "W202609270003", warehouse: "WH002" },
            summary: $t("ai.panel.preview.exceptionHandle.toolSummaryRoot"),
            ms: randInt(220, 500)
          },
          {
            name: "create_ticket",
            args: { type: "replenish", priority: "P0" },
            summary: $t("ai.panel.preview.exceptionHandle.toolSummaryTicket"),
            ms: randInt(90, 200)
          }
        ],
        steps: [
          {
            key: "detect",
            title: $t("ai.panel.preview.exceptionHandle.stepConfirm")
          },
          {
            key: "root",
            title: $t("ai.panel.preview.exceptionHandle.stepRoot")
          },
          {
            key: "plan",
            title: $t("ai.panel.preview.exceptionHandle.stepPlan")
          },
          {
            key: "ticket",
            title: $t("ai.panel.preview.exceptionHandle.stepTicket")
          }
        ],
        body: $t("ai.panel.preview.exceptionHandle.body"),
        suggestions: [
          $t("ai.panel.preview.exceptionHandle.s1"),
          $t("ai.panel.preview.exceptionHandle.s2"),
          $t("ai.panel.preview.exceptionHandle.s3")
        ]
      };
    }
    default:
      return {
        thought: $t("ai.panel.preview.general.thought"),
        tools: [],
        body: $t("ai.panel.preview.general.body", { question }),
        suggestions: [
          $t("ai.panel.preview.general.s1"),
          $t("ai.panel.preview.general.s2"),
          $t("ai.panel.preview.general.s3")
        ]
      };
  }
}

/** 本地预览引擎：按远端 SSE 同一契约生成事件流 */
async function streamLocalPreview(
  messages: AgentChatTurn[],
  handlers: AgentStreamHandlers,
  signal?: AbortSignal
) {
  try {
    const last =
      [...messages].reverse().find(m => m.role === "user")?.content ?? "";
    const intent = detectIntent(last);
    const script = buildScript(intent, last);

    await sleep(randInt(200, 420), signal);
    handlers.onThought?.(script.thought);

    // 工具调用轨迹
    let toolIdx = 0;
    for (const tool of script.tools) {
      toolIdx += 1;
      const id = `call-${toolIdx}`;
      handlers.onToolCall?.({
        type: "tool_call",
        id,
        name: tool.name,
        args: tool.args
      });
      await sleep(tool.ms, signal);
      handlers.onToolResult?.({
        type: "tool_result",
        id,
        name: tool.name,
        summary: tool.summary,
        ms: tool.ms
      });
    }

    // 工作流步骤（逐个 running → success）
    if (script.steps?.length) {
      for (const step of script.steps) {
        handlers.onStep?.({ type: "step", ...step, status: "running" });
        await sleep(randInt(300, 650), signal);
        handlers.onStep?.({ type: "step", ...step, status: "success" });
      }
    }

    // 正文打字机输出
    let sent = 0;
    while (sent < script.body.length) {
      const size = randInt(2, 5);
      handlers.onDelta?.(script.body.slice(sent, sent + size));
      sent += size;
      await sleep(randInt(10, 26), signal);
    }

    handlers.onDone?.({
      type: "done",
      usage: { tokens: randInt(420, 1800) },
      suggestions: script.suggestions
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return;
    handlers.onError?.(
      (err as Error)?.message ?? $t("ai.panel.preview.engineError")
    );
  }
}

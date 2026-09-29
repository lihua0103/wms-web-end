<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";

import { $t } from "@/plugins/i18n";

import RobotIcon from "~icons/ri/robot-2-line";
import SendIcon from "~icons/ri/send-plane-fill";
import SearchIcon from "~icons/ep/search";
import TruckIcon from "~icons/ep/van";
import WarnIcon from "~icons/ep/warning";
import DataIcon from "~icons/ep/data-analysis";
import CoinIcon from "~icons/ep/coin";
import TimerIcon from "~icons/ep/timer";
import DocIcon from "~icons/ep/document-checked";
import AidIcon from "~icons/ep/first-aid-kit";
import BrushIcon from "~icons/ep/brush";
import VideoPauseIcon from "~icons/ep/video-pause";

import {
  streamAgentChat,
  resetAgentSession,
  getAgentEngineMode
} from "@/api/ai";
import type { AgentChatTurn } from "@/api/ai";

defineOptions({ name: "LayAIAssistant" });

/** 工具调用轨迹 */
interface ToolTrace {
  id: string;
  name: string;
  summary?: string;
  ms?: number;
  running: boolean;
}

/** 工作流步骤轨迹 */
interface StepTrace {
  key: string;
  title: string;
  status: "running" | "success" | "failed";
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  /** 思考摘要 */
  thought?: string;
  /** 工具调用轨迹 */
  tools?: ToolTrace[];
  /** 工作流步骤 */
  steps?: StepTrace[];
  /** 追问建议 */
  suggestions?: string[];
  /** 是否流式输出中 */
  streaming?: boolean;
  /** Token 消耗 */
  tokens?: number;
}

const visible = ref(false);
const input = ref("");
const streaming = ref(false);
const scrollRef = ref<HTMLElement>();
let abortController: AbortController | null = null;

const GREETING = $t("ai.panel.greeting");

const messages = ref<ChatMessage[]>([{ role: "assistant", content: GREETING }]);

/** 引擎模式徽标（依据 platform-config.json） */
const engineMode = getAgentEngineMode();
const statusText =
  engineMode === "remote"
    ? $t("ai.panel.statusRemote")
    : engineMode === "local"
      ? $t("ai.panel.statusLocal")
      : $t("ai.panel.statusOff");

/** 技能卡（WMS + 国际物流，FR-2） */
const skills = [
  {
    icon: SearchIcon,
    title: $t("ai.panel.skill.checkStock.title"),
    prompt: $t("ai.panel.skill.checkStock.prompt"),
    tone: "blue"
  },
  {
    icon: TruckIcon,
    title: $t("ai.panel.skill.trackDocs.title"),
    prompt: $t("ai.panel.skill.trackDocs.prompt"),
    tone: "orange"
  },
  {
    icon: WarnIcon,
    title: $t("ai.panel.skill.findIssues.title"),
    prompt: $t("ai.panel.skill.findIssues.prompt"),
    tone: "red"
  },
  {
    icon: DataIcon,
    title: $t("ai.panel.skill.genReport.title"),
    prompt: $t("ai.panel.skill.genReport.prompt"),
    tone: "green"
  },
  {
    icon: CoinIcon,
    title: $t("ai.panel.skill.freightQuote.title"),
    prompt: $t("ai.panel.skill.freightQuote.prompt"),
    tone: "blue"
  },
  {
    icon: TimerIcon,
    title: $t("ai.panel.skill.etaQuery.title"),
    prompt: $t("ai.panel.skill.etaQuery.prompt"),
    tone: "orange"
  },
  {
    icon: DocIcon,
    title: $t("ai.panel.skill.customsCheck.title"),
    prompt: $t("ai.panel.skill.customsCheck.prompt"),
    tone: "green"
  },
  {
    icon: AidIcon,
    title: $t("ai.panel.skill.exceptionHandle.title"),
    prompt: $t("ai.panel.skill.exceptionHandle.prompt"),
    tone: "red"
  }
];

/** 最近一条助手消息的追问建议 */
const lastSuggestions = computed(() => {
  const last = [...messages.value]
    .reverse()
    .find(m => m.role === "assistant" && m.suggestions?.length);
  return last?.streaming ? [] : (last?.suggestions ?? []);
});

/** 轻量富文本：转义后支持 **加粗**（防 XSS） */
function renderRich(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function scrollToBottom() {
  nextTick(() =>
    scrollRef.value?.scrollTo({ top: 999999, behavior: "smooth" })
  );
}

watch(
  () =>
    messages.value.map(m => m.content.length + (m.steps?.length ?? 0)).join(),
  scrollToBottom
);

/** 发送指令：走 SSE 流（远端网关优先，自动降级本地预览引擎） */
function send(text?: string) {
  const q = (text ?? input.value).trim();
  if (!q || streaming.value) return;
  if (engineMode === "off") {
    messages.value.push({
      role: "assistant",
      content: $t("ai.panel.disabledMsg")
    });
    scrollToBottom();
    return;
  }

  messages.value.push({ role: "user", content: q });
  input.value = "";

  // 关键：push 后必须从数组取回响应式代理引用；
  // 直接持有并修改原始对象不会触发视图更新（流式过程会一次性整段出现）
  messages.value.push({
    role: "assistant",
    content: "",
    streaming: true
  });
  const reply = messages.value[messages.value.length - 1];

  const history: AgentChatTurn[] = messages.value
    .filter(m => m.content && !m.streaming)
    .slice(-8)
    .map(m => ({ role: m.role, content: m.content }));

  abortController = new AbortController();
  streaming.value = true;

  streamAgentChat(
    history,
    {
      onThought: text => {
        reply.thought = text;
        scrollToBottom();
      },
      onToolCall: e => {
        reply.tools = [
          ...(reply.tools ?? []),
          { id: e.id, name: e.name, running: true }
        ];
        scrollToBottom();
      },
      onToolResult: e => {
        const trace = reply.tools?.find(t => t.id === e.id);
        if (trace) {
          trace.running = false;
          trace.summary = e.summary;
          trace.ms = e.ms;
        }
        scrollToBottom();
      },
      onStep: e => {
        const steps = reply.steps ?? [];
        const hit = steps.find(s => s.key === e.key);
        if (hit) {
          hit.status = e.status;
        } else {
          steps.push({ key: e.key, title: e.title, status: e.status });
          reply.steps = steps;
        }
        scrollToBottom();
      },
      onDelta: text => {
        reply.content += text;
      },
      onDone: e => {
        reply.streaming = false;
        reply.suggestions = e.suggestions;
        reply.tokens = e.usage.tokens;
        scrollToBottom();
      },
      onError: msg => {
        reply.streaming = false;
        reply.content += `${reply.content ? "\n\n" : ""}⚠ ${msg}`;
        scrollToBottom();
      }
    },
    abortController.signal
  ).finally(() => {
    streaming.value = false;
    abortController = null;
  });
}

/** 停止生成 */
function stopStream() {
  abortController?.abort();
  const last = messages.value[messages.value.length - 1];
  if (last?.streaming) {
    last.streaming = false;
    last.content += `\n\n${$t("ai.panel.stopped")}`;
  }
  streaming.value = false;
}

/** 清空会话 */
function clearSession() {
  if (streaming.value) stopStream();
  resetAgentSession();
  messages.value = [{ role: "assistant", content: GREETING }];
}
</script>

<template>
  <span
    class="ai-entry"
    :title="$t('ai.panel.agentName')"
    @click="visible = true"
  >
    <IconifyIconOffline :icon="RobotIcon" />
    <span class="label">{{ $t("ai.panel.entryLabel") }}</span>
    <span class="dot" />
  </span>

  <el-drawer
    v-model="visible"
    :size="460"
    :with-header="false"
    append-to-body
    class="ai-drawer"
  >
    <div class="ai-panel">
      <header class="ai-header">
        <div class="ai-avatar">
          <IconifyIconOffline :icon="RobotIcon" />
        </div>
        <div class="ai-meta">
          <div class="ai-name">{{ $t("ai.panel.agentName") }}</div>
          <div class="ai-status" :class="{ off: engineMode === 'off' }">
            <i />{{ statusText }}
          </div>
        </div>
        <span
          class="ai-act"
          :title="$t('ai.panel.clearSession')"
          @click="clearSession"
        >
          <IconifyIconOffline :icon="BrushIcon" />
        </span>
        <span
          class="ai-act"
          :title="$t('ai.panel.collapse')"
          @click="visible = false"
        >
          <IconifyIconOffline
            :icon="SendIcon"
            style="transform: rotate(90deg)"
          />
        </span>
      </header>

      <div ref="scrollRef" class="ai-body">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="ai-msg"
          :class="msg.role"
        >
          <div class="bubble">
            <!-- 思考摘要 -->
            <div v-if="msg.thought" class="thought">
              <IconifyIconOffline icon="ep/magic-stick" />
              <span>{{ msg.thought }}</span>
            </div>

            <!-- 工具调用轨迹 -->
            <div v-if="msg.tools?.length" class="tools">
              <div v-for="t in msg.tools" :key="t.id" class="tool">
                <IconifyIconOffline icon="ep/set-up" />
                <span class="name">{{ t.name }}</span>
                <span v-if="t.running" class="pending">
                  {{ $t("ai.panel.toolCalling") }}
                </span>
                <span v-else class="done">{{ t.summary }} · {{ t.ms }}ms</span>
              </div>
            </div>

            <!-- 工作流步骤 -->
            <div v-if="msg.steps?.length" class="steps">
              <div
                v-for="s in msg.steps"
                :key="s.key"
                class="step"
                :class="s.status"
              >
                <IconifyIconOffline
                  :icon="
                    s.status === 'running'
                      ? 'ep/loading'
                      : s.status === 'success'
                        ? 'ep/circle-check-filled'
                        : 'ep/circle-close-filled'
                  "
                  :class="{ spin: s.status === 'running' }"
                />
                <span>{{ s.title }}</span>
              </div>
            </div>

            <!-- 正文（轻量富文本 + 流式光标） -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="rich" v-html="renderRich(msg.content)" />
            <span v-if="msg.streaming && msg.content" class="cursor" />

            <!-- Token 统计 -->
            <div v-if="msg.tokens" class="tokens">
              {{
                $t("ai.panel.tokenUsage", {
                  count: msg.tokens.toLocaleString()
                })
              }}
            </div>
          </div>
        </div>

        <!-- 追问建议 -->
        <div v-if="lastSuggestions.length && !streaming" class="ai-suggest">
          <span
            v-for="s in lastSuggestions"
            :key="s"
            class="chip"
            @click="send(s)"
          >
            {{ s }}
          </span>
        </div>

        <div v-if="messages.length <= 1" class="ai-skills">
          <div
            v-for="skill in skills"
            :key="skill.title"
            class="ai-skill"
            @click="send(skill.prompt)"
          >
            <el-icon :size="18" :class="skill.tone">
              <component :is="skill.icon" />
            </el-icon>
            <div>
              <div class="t">{{ skill.title }}</div>
            </div>
          </div>
        </div>
      </div>

      <footer class="ai-footer">
        <el-input
          v-model="input"
          :disabled="engineMode === 'off'"
          :placeholder="$t('ai.panel.inputPh')"
          @keyup.enter="send()"
        />
        <el-button
          v-if="!streaming"
          type="primary"
          class="ai-send"
          :disabled="!input.trim()"
          @click="send()"
        >
          <IconifyIconOffline :icon="SendIcon" />
        </el-button>
        <el-button v-else type="danger" class="ai-send" @click="stopStream">
          <IconifyIconOffline :icon="VideoPauseIcon" />
        </el-button>
      </footer>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
@media (width <= 600px) {
  .ai-entry {
    right: 16px;
    bottom: 18px;
    justify-content: center;
    width: 48px;
    padding: 0;
    border-radius: 50%;
  }

  .ai-entry .label {
    display: none;
  }
}

.ai-entry {
  position: fixed;
  right: 26px;
  bottom: 30px;
  z-index: 1200;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  height: 56px;
  padding: 0 16px 0 12px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  background: var(--el-color-primary);
  border: 2px solid
    color-mix(in srgb, var(--pure-theme-menu-active-before) 75%, #fff);
  border-radius: 30px;
  box-shadow:
    0 12px 28px -10px
      color-mix(in srgb, var(--el-color-primary) 80%, transparent),
    0 0 0 5px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    box-shadow: 0 14px 30px -10px
      color-mix(in srgb, var(--el-color-primary) 82%, transparent);
    transform: translateY(-2px);
  }

  &::before {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 11px;
    font-weight: 800;
    color: var(--el-color-primary);
    letter-spacing: 0.5px;
    content: "AI";
    background: #fff;
    border-radius: 50%;
  }

  .label {
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .dot {
    width: 7px;
    height: 7px;
    background: var(--el-color-success);
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgb(255 255 255 / 24%);
    animation: ai-pulse 1.8s ease-out infinite;
  }
}

/* 悬浮智能体入口：保持常驻可见，但不占用顶栏操作区 */
</style>

<style lang="scss">
@keyframes ai-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes ai-blink {
  50% {
    opacity: 0;
  }
}

@keyframes ai-pulse {
  70% {
    box-shadow: 0 0 0 7px rgb(255 255 255 / 0%);
  }

  100% {
    box-shadow: 0 0 0 0 rgb(255 255 255 / 0%);
  }
}

.ai-drawer {
  .el-drawer__body {
    padding: 0;
  }

  .ai-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .ai-header {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 16px 18px;
    color: #fff;
    background: linear-gradient(
      135deg,
      var(--el-color-primary),
      var(--el-color-primary-light-3)
    );

    .ai-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      font-size: 22px;
      background: rgb(255 255 255 / 18%);
      border: 1px solid rgb(255 255 255 / 35%);
      border-radius: 12px;
    }

    .ai-name {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .ai-status {
      display: flex;
      gap: 5px;
      align-items: center;
      margin-top: 2px;
      font-size: 12px;
      color: rgb(255 255 255 / 85%);

      i {
        width: 6px;
        height: 6px;
        background: #4ade80;
        border-radius: 50%;
      }

      &.off i {
        background: #94a3b8;
      }
    }

    .ai-act {
      margin-left: auto;
      font-size: 16px;
      color: rgb(255 255 255 / 85%);
      cursor: pointer;

      & + .ai-act {
        margin-left: 0;
      }

      &:hover {
        color: #fff;
      }
    }
  }

  .ai-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: var(--el-bg-color-page);
  }

  .ai-msg {
    display: flex;
    margin-bottom: 12px;

    .bubble {
      max-width: 88%;
      padding: 10px 14px;
      font-size: 13.5px;
      line-height: 1.65;
      border-radius: 12px;
    }

    &.assistant {
      justify-content: flex-start;

      .bubble {
        color: var(--el-text-color-primary);
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color-light);
        border-top-left-radius: 4px;
      }
    }

    &.user {
      justify-content: flex-end;

      .bubble {
        color: #fff;
        background: linear-gradient(
          135deg,
          var(--el-color-primary),
          var(--el-color-primary-light-3)
        );
        border-top-right-radius: 4px;
      }
    }

    .thought {
      display: flex;
      gap: 6px;
      align-items: flex-start;
      padding: 6px 10px;
      margin-bottom: 8px;
      font-size: 12px;
      font-style: italic;
      color: var(--el-text-color-secondary);
      word-break: break-all;
      background: var(--el-fill-color);
      border-radius: 8px;

      .svg-icon,
      .iconify {
        flex-shrink: 0;
        margin-top: 1px;
      }
    }

    .tools {
      margin-bottom: 8px;

      .tool {
        display: flex;
        gap: 6px;
        align-items: center;
        padding: 4px 10px;
        margin-bottom: 4px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
        color: var(--el-text-color-regular);
        word-break: break-all;
        background: var(--el-fill-color-light);
        border: 1px dashed var(--el-border-color);
        border-radius: 999px;

        .name {
          font-weight: 600;
        }

        .pending {
          color: var(--el-color-warning);
        }

        .done {
          color: var(--el-color-success);
        }
      }
    }

    .steps {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;

      .step {
        display: inline-flex;
        gap: 4px;
        align-items: center;
        padding: 3px 10px;
        font-size: 12px;
        color: var(--el-text-color-regular);
        background: var(--el-fill-color);
        border-radius: 999px;

        &.success {
          color: var(--el-color-success);
          background: var(--el-color-success-light-9);
        }

        &.running {
          color: var(--el-color-warning);
          background: var(--el-color-warning-light-9);
        }

        &.failed {
          color: var(--el-color-danger);
          background: var(--el-color-danger-light-9);
        }

        .spin {
          animation: ai-rotate 1s linear infinite;
        }
      }
    }

    .rich {
      word-break: break-word;
      white-space: pre-wrap;

      strong {
        font-weight: 600;
      }
    }

    .cursor {
      display: inline-block;
      width: 7px;
      height: 15px;
      margin-left: 2px;
      vertical-align: text-bottom;
      background: var(--el-color-primary);
      animation: ai-blink 0.8s step-end infinite;
    }

    .tokens {
      margin-top: 6px;
      font-size: 11px;
      color: var(--el-text-color-secondary);
      text-align: right;
    }
  }

  .ai-suggest {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;

    .chip {
      padding: 4px 12px;
      font-size: 12.5px;
      color: var(--el-color-primary);
      cursor: pointer;
      background: var(--el-bg-color);
      border: 1px solid
        color-mix(in srgb, var(--el-color-primary) 35%, var(--el-bg-color));
      border-radius: 999px;
      transition:
        background-color 0.2s,
        color 0.2s;

      &:hover {
        color: #fff;
        background: var(--el-color-primary);
      }
    }
  }

  .ai-skills {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 4px;
  }

  .ai-skill {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 11px 12px;
    cursor: pointer;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 10px;
    transition:
      border-color 0.2s,
      box-shadow 0.2s,
      transform 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 4px 12px -4px
        color-mix(in srgb, var(--el-color-primary) 30%, transparent);
      transform: translateY(-1px);
    }

    .el-icon {
      &.blue {
        color: var(--el-color-primary);
      }

      &.orange {
        color: #f97316;
      }

      &.red {
        color: var(--el-color-danger);
      }

      &.green {
        color: var(--el-color-success);
      }
    }

    .t {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .ai-footer {
    display: flex;
    gap: 10px;
    padding: 14px 16px;
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-light);

    .el-input__wrapper {
      border-radius: 999px;
    }

    .ai-send {
      width: 40px;
      height: 32px;
      padding: 0;
      font-size: 15px;
      border-radius: 999px;
    }
  }
}

/* 抽屉挂载于 body，需全局作用域；统一 .ai-drawer 前缀避免污染 */
</style>

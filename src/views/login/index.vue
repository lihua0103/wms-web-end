<script setup lang="ts">
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import { ref, reactive } from "vue";
import { debounce } from "@pureadmin/utils";
import { useNav } from "@/layout/hooks/useNav";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { useLayout } from "@/layout/hooks/useLayout";
import { $t } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import LayLocaleSwitch from "@/components/LayLocaleSwitch/index.vue";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";
import Key from "~icons/ri/key-2-line";
import ArrowRight from "~icons/ri/arrow-right-line";
import ShieldCheck from "~icons/ri/shield-check-line";
import Inbound from "~icons/ri/inbox-archive-line";
import Outbound from "~icons/ri/truck-line";
import Inventory from "~icons/ri/stack-line";
import Robot from "~icons/ri/robot-2-line";

defineOptions({
  name: "Login"
});

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title, getLogo } = useNav();

/** 记住我：回填上次登录账号 */
const remember = ref(!!localStorage.getItem("wms-remember-user"));
const lastUser = localStorage.getItem("wms-remember-user");

const DEMO_USER = "admin";
const DEMO_PASSWORD = "admin123";

const ruleForm = reactive({
  username: lastUser || DEMO_USER,
  password: DEMO_PASSWORD
});

/** 用户协议 */
const agreed = ref(true);

const fillDemo = () => {
  ruleForm.username = DEMO_USER;
  ruleForm.password = DEMO_PASSWORD;
};

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  if (!agreed.value) {
    message($t("login.agreeFirst"), { type: "warning" });
    return;
  }
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      if (remember.value) {
        localStorage.setItem("wms-remember-user", ruleForm.username);
      } else {
        localStorage.removeItem("wms-remember-user");
      }
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password
        })
        .then(res => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true;
              router
                .push(getTopMenu(true).path)
                .then(() => {
                  message($t("login.success"), { type: "success" });
                })
                .finally(() => (disabled.value = false));
            });
          } else {
            message($t("login.failed"), { type: "error" });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

const immediateDebounce: any = debounce(
  formRef => onLogin(formRef),
  1000,
  true
);

useEventListener(document, "keydown", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  )
    immediateDebounce(ruleFormRef.value);
});

/** 平台能力（静态展示） */
const capabilities = [
  { key: "inbound", icon: Inbound },
  { key: "outbound", icon: Outbound },
  { key: "inventory", icon: Inventory },
  { key: "ai", icon: Robot }
];

/** 浮动的实时作业卡片 */
const liveCards = [
  { key: "inbound", pos: "a", delay: "0s" },
  { key: "customs", pos: "b", delay: "-2.2s" },
  { key: "agv", pos: "c", delay: "-4.1s" }
];

/* ==========================================================================
   签名视觉：等轴测「数字孪生仓」
   2:1 等轴测投影。三排线框货架，已占用货位以信号青立方体点亮，
   部分货位呼吸闪烁表示正在作业，两台 AGV 沿巷道往返。
   所有几何在 setup 期一次性算好，模板只负责渲染。
   ========================================================================== */
const ISO_W = 64;
const ISO_H = 32;
const ISO_Z = 26;
const COLS = 10;
const ROWS = 9;
const BAY_FROM = 1;
const BAY_TO = 9;
const LEVELS = 3;
const ORIGIN: [number, number] = [304, 96];
const SCENE_W = 640;
const SCENE_H = 416;

type Pt = [number, number];

/** 原点在 (0,0) 的投影，用于随 animateMotion 平移的物体 */
const project = (x: number, y: number, z = 0): Pt => [
  ((x - y) * ISO_W) / 2,
  ((x + y) * ISO_H) / 2 - z * ISO_Z
];
/** 落到画布坐标的投影 */
const iso = (x: number, y: number, z = 0): Pt => {
  const [px, py] = project(x, y, z);
  return [px + ORIGIN[0], py + ORIGIN[1]];
};

const fmt = ([x, y]: Pt) => `${x.toFixed(1)},${y.toFixed(1)}`;
const polygon = (...p: Pt[]) => p.map(fmt).join(" ");
const line = (a: Pt, b: Pt) => `M${fmt(a)}L${fmt(b)}`;
const ring = (...p: Pt[]) => `M${p.map(fmt).join("L")}Z`;

/** 一个盒体的三个可见面：顶面 / 左前脸 (y = y1) / 右前脸 (x = x1) */
const box = (
  proj: (x: number, y: number, z?: number) => Pt,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number
) => ({
  top: polygon(
    proj(x0, y0, z1),
    proj(x1, y0, z1),
    proj(x1, y1, z1),
    proj(x0, y1, z1)
  ),
  left: polygon(
    proj(x0, y1, z0),
    proj(x1, y1, z0),
    proj(x1, y1, z1),
    proj(x0, y1, z1)
  ),
  right: polygon(
    proj(x1, y0, z0),
    proj(x1, y1, z0),
    proj(x1, y1, z1),
    proj(x1, y0, z1)
  )
});

/** 确定性伪随机：同一格子每次渲染结果一致 */
const noise = (x: number, y: number, k: number, salt: number) => {
  const v =
    Math.sin(x * 12.9898 + y * 78.233 + k * 37.719 + salt * 9.173) * 43758.5453;
  return v - Math.floor(v);
};

const floorPath = [
  ...Array.from({ length: ROWS + 1 }, (_, y) => line(iso(0, y), iso(COLS, y))),
  ...Array.from({ length: COLS + 1 }, (_, x) => line(iso(x, 0), iso(x, ROWS)))
].join("");

const agvBody = box(project, -0.34, -0.24, 0, 0.34, 0.24, 0.22);
const agvLoad = box(project, -0.22, -0.16, 0.22, 0.22, 0.16, 0.58);

/** 货架排（后 → 前），每排之后紧跟其前方巷道里的 AGV，保证遮挡顺序 */
const racks = [
  { y0: 1, agv: { path: line(iso(0.35, 3), iso(9.65, 3)), dur: "13s" } },
  { y0: 4, agv: { path: line(iso(9.65, 6), iso(0.35, 6)), dur: "17s" } },
  { y0: 7, agv: null }
].map(({ y0, agv }) => {
  const y1 = y0 + 1;
  const front = [
    ring(
      iso(BAY_FROM, y1, 0),
      iso(BAY_TO, y1, 0),
      iso(BAY_TO, y1, LEVELS),
      iso(BAY_FROM, y1, LEVELS)
    ),
    ring(
      iso(BAY_TO, y0, 0),
      iso(BAY_TO, y1, 0),
      iso(BAY_TO, y1, LEVELS),
      iso(BAY_TO, y0, LEVELS)
    ),
    ring(
      iso(BAY_FROM, y0, LEVELS),
      iso(BAY_TO, y0, LEVELS),
      iso(BAY_TO, y1, LEVELS),
      iso(BAY_FROM, y1, LEVELS)
    )
  ];
  const back = [
    line(iso(BAY_FROM, y0, 0), iso(BAY_TO, y0, 0)),
    line(iso(BAY_FROM, y0, 0), iso(BAY_FROM, y1, 0))
  ];
  for (let k = 1; k < LEVELS; k++) {
    front.push(
      line(iso(BAY_FROM, y1, k), iso(BAY_TO, y1, k)),
      line(iso(BAY_TO, y0, k), iso(BAY_TO, y1, k))
    );
    back.push(line(iso(BAY_FROM, y0, k), iso(BAY_TO, y0, k)));
  }
  for (let x = BAY_FROM; x <= BAY_TO; x++) {
    back.push(line(iso(x, y0, 0), iso(x, y0, LEVELS)));
    if (x > BAY_FROM && x < BAY_TO) {
      front.push(
        line(iso(x, y1, 0), iso(x, y1, LEVELS)),
        line(iso(x, y0, LEVELS), iso(x, y1, LEVELS))
      );
    }
  }

  const pallets: Array<{
    key: string;
    intensity: number;
    active: boolean;
    delay: string;
    top: string;
    left: string;
    right: string;
  }> = [];
  for (let x = BAY_FROM; x < BAY_TO; x++) {
    for (let k = 0; k < LEVELS; k++) {
      if (noise(x, y0, k, 1) > 0.58) continue;
      pallets.push({
        key: `${x}-${k}`,
        intensity: +(0.45 + noise(x, y0, k, 2) * 0.5).toFixed(2),
        active: noise(x, y0, k, 3) < 0.16,
        delay: `${(noise(x, y0, k, 4) * 4).toFixed(2)}s`,
        ...box(
          iso,
          x + 0.14,
          y0 + 0.14,
          k + 0.05,
          x + 0.86,
          y0 + 0.86,
          k + 0.66
        )
      });
    }
  }

  return { key: y0, front: front.join(""), back: back.join(""), pallets, agv };
});
</script>

<template>
  <div class="login-page">
    <!-- 藏青画布：品牌叙事 + 签名视觉 -->
    <section class="stage select-none">
      <div class="stage-glow" aria-hidden="true" />
      <div class="stage-dots" aria-hidden="true" />

      <header class="stage-head">
        <img :src="getLogo()" alt="logo" />
        <span>{{ title }}</span>
      </header>

      <div class="stage-body">
        <div class="stage-copy">
          <div class="eyebrow"><i />{{ $t("login.eyebrow") }}</div>
          <h1 class="headline">
            <span>{{ $t("login.headlineA") }}</span>
            <em>{{ $t("login.headlineB") }}</em>
          </h1>
          <p class="tagline">{{ $t("login.brandTagline") }}</p>
          <ul class="capabilities">
            <li v-for="c in capabilities" :key="c.key">
              <IconifyIconOffline :icon="c.icon" />
              <span>{{ $t(`login.capability.${c.key}`) }}</span>
            </li>
          </ul>
        </div>

        <div class="scene">
          <div class="scene-frame">
            <svg
              class="twin"
              :viewBox="`0 0 ${SCENE_W} ${SCENE_H}`"
              preserveAspectRatio="xMidYMax meet"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="lp-glow">
                  <stop offset="0" class="g-signal" stop-opacity="0.2" />
                  <stop offset="1" class="g-signal" stop-opacity="0" />
                </radialGradient>
                <linearGradient id="lp-fade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#fff" stop-opacity="0.1" />
                  <stop offset="0.55" stop-color="#fff" stop-opacity="0.75" />
                  <stop offset="1" stop-color="#fff" stop-opacity="1" />
                </linearGradient>
                <mask id="lp-floor-mask">
                  <rect
                    x="0"
                    y="0"
                    :width="SCENE_W"
                    :height="SCENE_H"
                    fill="url(#lp-fade)"
                  />
                </mask>
              </defs>

              <ellipse class="scene-halo" cx="330" cy="300" rx="310" ry="120" />
              <path
                class="iso-floor"
                :d="floorPath"
                mask="url(#lp-floor-mask)"
              />

              <g v-for="r in racks" :key="r.key">
                <path class="rack-back" :d="r.back" />
                <g
                  v-for="p in r.pallets"
                  :key="p.key"
                  class="pallet"
                  :class="{ active: p.active }"
                  :style="{ '--i': p.intensity, '--d': p.delay }"
                >
                  <polygon class="f-left" :points="p.left" />
                  <polygon class="f-right" :points="p.right" />
                  <polygon class="f-top" :points="p.top" />
                </g>
                <path class="rack-front" :d="r.front" />

                <template v-if="r.agv">
                  <path class="agv-path" :d="r.agv.path" />
                  <g class="agv">
                    <animateMotion
                      :dur="r.agv.dur"
                      repeatCount="indefinite"
                      :path="r.agv.path"
                    />
                    <polygon class="f-left" :points="agvBody.left" />
                    <polygon class="f-right" :points="agvBody.right" />
                    <polygon class="f-top" :points="agvBody.top" />
                    <g class="agv-load">
                      <polygon class="f-left" :points="agvLoad.left" />
                      <polygon class="f-right" :points="agvLoad.right" />
                      <polygon class="f-top" :points="agvLoad.top" />
                    </g>
                  </g>
                </template>
              </g>
            </svg>

            <div
              v-for="c in liveCards"
              :key="c.key"
              class="live-card"
              :class="`pos-${c.pos}`"
              :style="{ '--float-delay': c.delay }"
            >
              <i class="live-dot" />
              <div class="live-text">
                <strong>{{ $t(`login.live.${c.key}Title`) }}</strong>
                <span>{{ $t(`login.live.${c.key}Sub`) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="stage-foot">
        <span>{{ $t("login.footerPrivacy") }}</span>
        <span>{{ $t("login.footerTerms") }}</span>
        <span>{{ $t("login.footerHelp") }}</span>
        <span class="copyright">{{ $t("login.copyright") }}</span>
      </footer>
    </section>

    <!-- 表单纸：内嵌在画布右侧 -->
    <section class="sheet">
      <div class="sheet-toolbar">
        <LayLocaleSwitch />
        <el-switch
          v-model="dataTheme"
          inline-prompt
          :active-icon="dayIcon"
          :inactive-icon="darkIcon"
          @change="dataThemeChange"
        />
      </div>

      <div class="auth-box">
        <div class="auth-brand">
          <img :src="getLogo()" alt="logo" />
          <span>{{ title }}</span>
        </div>

        <h2 class="auth-title">{{ $t("login.welcomeTitle") }}</h2>
        <p class="auth-sub">{{ $t("login.continueHint", { title }) }}</p>

        <el-form
          ref="ruleFormRef"
          class="auth-form"
          :model="ruleForm"
          :rules="loginRules"
          size="large"
          label-position="top"
          @submit.prevent
        >
          <el-form-item prop="username" :label="$t('login.username')">
            <el-input
              v-model="ruleForm.username"
              clearable
              :placeholder="$t('login.usernamePlaceholder')"
              :prefix-icon="useRenderIcon(User)"
            />
          </el-form-item>

          <el-form-item prop="password" :label="$t('login.password')">
            <el-input
              v-model="ruleForm.password"
              clearable
              show-password
              :placeholder="$t('login.passwordPlaceholder')"
              :prefix-icon="useRenderIcon(Lock)"
            />
          </el-form-item>

          <div class="form-row">
            <el-checkbox v-model="remember">
              {{ $t("login.rememberMe") }}
            </el-checkbox>
            <span
              class="text-link"
              @click="message($t('login.contactAdminReset'), { type: 'info' })"
            >
              {{ $t("login.forgotPassword") }}
            </span>
          </div>

          <el-button
            class="cta-btn"
            size="large"
            type="primary"
            :loading="loading"
            :disabled="disabled"
            @click="onLogin(ruleFormRef)"
          >
            <span>{{ $t("login.cta") }}</span>
            <IconifyIconOffline :icon="ArrowRight" class="cta-arrow" />
          </el-button>

          <el-checkbox v-model="agreed" class="agree-check">
            {{ $t("login.agreePrefix") }}
            <span class="text-link">{{ $t("login.userAgreement") }}</span>
            {{ $t("login.agreeAnd") }}
            <span class="text-link">{{ $t("login.privacyPolicy") }}</span>
          </el-checkbox>
        </el-form>

        <div class="demo-tip" @click="fillDemo">
          <IconifyIconOffline :icon="Key" />
          <span class="demo-text">{{ $t("login.demoAccount") }}</span>
          <span class="demo-fill">{{ $t("login.demoFill") }}</span>
        </div>

        <div class="secure-note">
          <IconifyIconOffline :icon="ShieldCheck" />
          {{ $t("login.secureNote") }}
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
/* ==========================================================================
   登录页「数字孪生仓」
   整页一块藏青画布：左侧品牌叙事 + 等轴测线框仓库签名视觉；
   右侧一张内嵌圆角「表单纸」，Element 原生渲染，跟随明暗模式。
   断点一律嵌套写在各自选择器内部，避免顶层 @media 被后声明的基础规则覆盖。
   ========================================================================== */

/* ===== 动画 ===== */
@keyframes pallet-breathe {
  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }
}

@keyframes card-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes dot-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--lp-signal) 45%, transparent);
  }

  100% {
    box-shadow: 0 0 0 8px color-mix(in srgb, var(--lp-signal) 0%, transparent);
  }
}

.login-page {
  /* 画布与侧边栏同源（--wms-navy），主色只做轻微染色，任何主题色下都是同一块藏青 */
  --lp-canvas: color-mix(in srgb, var(--el-color-primary) 8%, var(--wms-navy));
  --lp-canvas-deep: color-mix(
    in srgb,
    var(--el-color-primary) 4%,
    var(--wms-navy-deep)
  );
  --lp-signal: var(--wms-signal);
  --lp-text: rgb(255 255 255 / 94%);
  --lp-text-2: var(--wms-navy-text);
  --lp-text-3: var(--wms-navy-text-dim);
  --lp-line: var(--wms-navy-line);
  --lp-inset: 16px;

  display: flex;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(
    165deg,
    var(--lp-canvas) 0%,
    var(--lp-canvas-deep) 100%
  );
}

/* ===== 左：画布 ===== */
.stage {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 28px 40px 22px 48px;
  color: var(--lp-text);
  isolation: isolate;

  @media (width <= 1280px) {
    padding: 24px 32px 20px 40px;
  }

  @media (width <= 900px) {
    display: none;
  }
}

.stage-glow {
  position: absolute;
  top: -260px;
  left: -200px;
  z-index: -1;
  width: 820px;
  height: 820px;
  pointer-events: none;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--el-color-primary) 36%, transparent) 0,
    transparent 60%
  );
}

.stage-dots {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: radial-gradient(
    rgb(255 255 255 / 10%) 1px,
    transparent 1px
  );
  background-size: 26px 26px;
  mask-image: linear-gradient(180deg, rgb(0 0 0 / 80%) 0%, transparent 70%);
}

.stage-head {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 16px;
  font-weight: 650;
  letter-spacing: 0.2px;

  img {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    box-shadow: 0 8px 20px -6px
      color-mix(in srgb, var(--el-color-primary) 70%, transparent);
  }
}

/* 宽屏：文案与场景左右并置、垂直居中；宽屏以下改为上下堆叠、左对齐成一条内容柱 */
.stage-body {
  display: flex;
  flex: 1;
  gap: 40px;
  align-items: center;
  min-height: 0;
  margin-top: 16px;

  @media (width <= 1800px) {
    flex-direction: column;
    gap: 0;
    align-items: flex-start;
  }
}

.stage-copy {
  flex: 0 0 auto;
  max-width: 540px;

  @media (width <= 1800px) {
    margin-top: clamp(24px, 5vh, 64px);
  }
}

.eyebrow {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--lp-signal);
  letter-spacing: 2.6px;

  i {
    width: 6px;
    height: 6px;
    background: currentcolor;
    border-radius: 50%;
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--lp-signal) 18%, transparent);
  }
}

.headline {
  margin: 20px 0 18px;
  font-size: clamp(40px, 3.2vw, 54px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -1.4px;

  @media (width <= 1280px) {
    font-size: clamp(34px, 3.4vw, 46px);
  }

  span,
  em {
    display: block;
  }

  em {
    font-style: normal;
    color: var(--lp-signal);
  }
}

.tagline {
  max-width: 540px;
  margin: 0;
  font-size: 15px;
  line-height: 1.8;
  color: var(--lp-text-2);
}

.capabilities {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 8px;
  padding: 0;
  margin: 26px 0 0;
  list-style: none;

  li {
    display: inline-flex;
    gap: 7px;
    align-items: center;
    height: 30px;
    padding: 0 12px 0 10px;
    font-size: 12.5px;
    color: var(--lp-text-2);
    border: 1px solid var(--lp-line);
    border-radius: 999px;

    svg {
      font-size: 15px;
      color: var(--lp-signal);
    }
  }
}

/* ---- 签名视觉：等轴测数字孪生仓 ---- */
.scene {
  position: relative;
  flex: 1;
  align-self: stretch;
  min-width: 0;
  min-height: 0;
  container-type: size;

  @media (width <= 1800px) {
    margin-top: 16px;
  }

  @media (height <= 640px) {
    display: none;
  }
}

/* 用容器高度反推宽度，保证外框始终与 SVG 绘制区严格重合，浮动卡片才能对得上位 */
.scene-frame {
  position: absolute;
  top: 50%;
  right: 0;
  width: min(100%, calc(100cqh * 640 / 416), 860px);
  aspect-ratio: 640 / 416;
  transform: translateY(-50%);

  @media (width <= 1800px) {
    inset: auto auto 0 0;
    transform: none;
  }
}

.twin {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.g-signal {
  stop-color: var(--lp-signal);
}

.scene-halo {
  fill: url("#lp-glow");
}

.iso-floor {
  fill: none;
  stroke: rgb(255 255 255 / 8%);
  stroke-width: 1;
}

.rack-back {
  fill: none;
  stroke: rgb(255 255 255 / 9%);
  stroke-width: 1;
}

.rack-front {
  fill: none;
  stroke: rgb(255 255 255 / 26%);
  stroke-width: 1;
  stroke-linejoin: round;
}

.pallet {
  opacity: var(--i);

  .f-top {
    fill: var(--lp-signal);
  }

  .f-left {
    fill: color-mix(in srgb, var(--lp-signal) 62%, var(--lp-canvas-deep));
  }

  .f-right {
    fill: color-mix(in srgb, var(--lp-signal) 40%, var(--lp-canvas-deep));
  }

  &.active {
    filter: drop-shadow(
      0 0 6px color-mix(in srgb, var(--lp-signal) 85%, transparent)
    );
    animation: pallet-breathe 3.6s ease-in-out infinite;
    animation-delay: var(--d);

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }
}

.agv-path {
  fill: none;
  stroke: color-mix(in srgb, var(--lp-signal) 45%, transparent);
  stroke-width: 1;
  stroke-dasharray: 2 6;
}

.agv {
  @media (prefers-reduced-motion: reduce) {
    display: none;
  }

  .f-top {
    fill: rgb(255 255 255 / 88%);
  }

  .f-left {
    fill: rgb(255 255 255 / 58%);
  }

  .f-right {
    fill: rgb(255 255 255 / 36%);
  }

  .agv-load {
    .f-top {
      fill: var(--lp-signal);
    }

    .f-left {
      fill: color-mix(in srgb, var(--lp-signal) 62%, var(--lp-canvas-deep));
    }

    .f-right {
      fill: color-mix(in srgb, var(--lp-signal) 40%, var(--lp-canvas-deep));
    }
  }
}

/* 浮动的实时作业卡片 */
.live-card {
  position: absolute;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 9px 14px 9px 11px;
  white-space: nowrap;
  background: rgb(255 255 255 / 7%);
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 10px;
  box-shadow: 0 16px 36px -14px rgb(0 0 0 / 55%);
  backdrop-filter: blur(12px);
  animation: card-float 6s ease-in-out infinite;
  animation-delay: var(--float-delay);

  @media (width <= 1080px) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  &.pos-a {
    top: 6%;
    right: 3%;
  }

  &.pos-b {
    top: 46%;
    left: 1%;
  }

  &.pos-c {
    right: 10%;
    bottom: 8%;
  }
}

.live-dot {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  background: var(--lp-signal);
  border-radius: 50%;
  animation: dot-pulse 2.4s ease-out infinite;
  animation-delay: var(--float-delay);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

.live-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.25;

  strong {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--lp-text);
  }

  span {
    font-size: 11px;
    color: var(--lp-text-3);
  }
}

.stage-foot {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-top: 20px;
  font-size: 12px;
  color: var(--lp-text-3);

  span:not(.copyright) {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--lp-text);
    }
  }

  .copyright {
    margin-left: auto;
  }
}

/* ===== 右：表单纸 ===== */
.sheet {
  position: relative;
  display: flex;
  flex: 0 0 clamp(440px, 34vw, 560px);
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 80px 48px 40px;
  margin: var(--lp-inset) var(--lp-inset) var(--lp-inset) 0;
  background: var(--el-bg-color);
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 6%),
    0 32px 80px -32px rgb(0 0 0 / 60%);

  @media (width <= 900px) {
    flex: 1;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }

  @media (width <= 480px) {
    padding: 72px 20px 28px;
  }
}

.sheet-toolbar {
  position: absolute;
  top: 20px;
  right: 24px;
  display: flex;
  gap: 10px;
  align-items: center;

  @media (width <= 480px) {
    top: 14px;
    right: 14px;
  }

  :deep(.locale-switch) {
    width: auto;
    height: 36px;
    padding: 0 10px;
    font-size: 15px;
    border-radius: 8px;
  }
}

.auth-box {
  width: 100%;
  max-width: 372px;
}

/* 仅窄屏（画布隐藏时）显示 */
.auth-brand {
  display: none;
  gap: 10px;
  align-items: center;
  margin-bottom: 28px;
  font-size: 16px;
  font-weight: 650;
  color: var(--el-text-color-primary);

  @media (width <= 900px) {
    display: flex;
  }

  img {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
}

.auth-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  letter-spacing: -0.4px;

  @media (width <= 480px) {
    font-size: 24px;
  }
}

.auth-sub {
  margin: 0 0 32px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.auth-form {
  /* 登录表单控件加高一档 */
  --el-component-size-large: 46px;

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    padding-bottom: 6px;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    color: var(--el-text-color-regular);
  }

  :deep(.el-input__wrapper) {
    padding: 1px 14px;
    border-radius: 8px;
    transition: box-shadow 0.2s;

    &.is-focus {
      box-shadow:
        0 0 0 1px var(--el-color-primary) inset,
        0 0 0 4px var(--el-color-primary-light-9);
    }
  }

  :deep(.el-input__prefix) {
    color: var(--el-text-color-placeholder);
  }
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -6px 0 22px;
}

.text-link {
  font-size: 13px;
  color: var(--el-color-primary);
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--el-color-primary-light-3);
  }
}

.cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  border-radius: 8px;

  .cta-arrow {
    margin-left: 6px;
    font-size: 17px;
    transition: transform 0.2s;
  }

  &:hover .cta-arrow {
    transform: translateX(3px);
  }
}

.agree-check {
  align-items: flex-start;
  height: auto;
  margin-top: 16px;

  :deep(.el-checkbox__input) {
    margin-top: 3px;
  }

  :deep(.el-checkbox__label) {
    font-size: 12.5px;
    line-height: 1.6;
    white-space: normal;
  }

  .text-link {
    font-size: inherit;
  }
}

/* 演示账号：整条可点，一键填入 */
.demo-tip {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  margin-top: 28px;
  font-size: 12.5px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  transition:
    border-color 0.2s,
    background-color 0.2s;

  svg {
    font-size: 15px;
    color: var(--el-color-primary);
  }

  .demo-text {
    flex: 1;
  }

  .demo-fill {
    font-weight: 500;
    color: var(--el-color-primary);
  }

  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}

.secure-note {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  font-size: 12px;
  color: var(--el-text-color-secondary);

  svg {
    font-size: 14px;
    color: var(--el-color-success);
  }
}
</style>

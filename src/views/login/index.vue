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
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";
import Download from "~icons/ep/download";
import Upload from "~icons/ep/upload";
import BoxIcon from "~icons/ep/box";
import Van from "~icons/ep/van";
import DataLine from "~icons/ep/data-line";
import Monitor from "~icons/ep/monitor";

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
const { title } = useNav();

/** 记住我：回填上次登录账号 */
const remember = ref(!!localStorage.getItem("wms-remember-user"));
const lastUser = localStorage.getItem("wms-remember-user");

const ruleForm = reactive({
  username: lastUser || "admin",
  password: "admin123"
});

/** 用户协议 */
const agreed = ref(true);

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

/** 品牌展示数据（静态演示） */
const features = [
  {
    icon: Download,
    title: $t("login.features.inbound"),
    sub: $t("login.features.inboundSub")
  },
  {
    icon: Upload,
    title: $t("login.features.outbound"),
    sub: $t("login.features.outboundSub")
  },
  {
    icon: BoxIcon,
    title: $t("login.features.inventory"),
    sub: $t("login.features.inventorySub")
  },
  {
    icon: Monitor,
    title: $t("login.features.equipment"),
    sub: $t("login.features.equipmentSub")
  },
  {
    icon: DataLine,
    title: $t("login.features.insight"),
    sub: $t("login.features.insightSub")
  }
];

const weekBars = [
  { d: $t("login.week.mon"), v: 62 },
  { d: $t("login.week.tue"), v: 78 },
  { d: $t("login.week.wed"), v: 55 },
  { d: $t("login.week.thu"), v: 90 },
  { d: $t("login.week.fri"), v: 72 },
  { d: $t("login.week.sat"), v: 40 },
  { d: $t("login.week.sun"), v: 30 }
];
</script>

<template>
  <div class="login-page select-none">
    <!-- 右上角主题切换 -->
    <div class="login-toolbar">
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>

    <div class="login-body">
      <!-- 左侧品牌展示区 -->
      <div class="brand-panel">
        <div class="brand-logo">
          <div class="brand-mark">{{ $t("login.brandMark") }}</div>
          <span class="brand-name">{{ title }}</span>
        </div>

        <h1 class="brand-title">
          {{ $t("login.brandTitle") }}<br />
          <span class="brand-title-accent">{{ $t("app.subtitle") }}</span>
        </h1>
        <p class="brand-tagline">
          {{ $t("login.brandTagline") }}
        </p>

        <!-- 特性图标行 -->
        <div class="feature-row">
          <div v-for="f in features" :key="f.title" class="feature-item">
            <div class="feature-icon">
              <el-icon :size="20">
                <component :is="f.icon" />
              </el-icon>
            </div>
            <div class="feature-title">{{ f.title }}</div>
            <div class="feature-sub">{{ f.sub }}</div>
          </div>
        </div>

        <!-- 迷你数据看板 -->
        <div class="mini-dashboard">
          <div class="mini-card kpi">
            <div class="mini-card-head">
              {{ $t("login.dashboard.todayWork") }}
            </div>
            <div class="mini-kpi-row">
              <div>
                <div class="mini-kpi-num blue">326</div>
                <div class="mini-kpi-label">
                  {{ $t("login.dashboard.inboundOrders") }}
                </div>
              </div>
              <div class="mini-kpi-divider" />
              <div>
                <div class="mini-kpi-num green">512</div>
                <div class="mini-kpi-label">
                  {{ $t("login.dashboard.outboundOrders") }}
                </div>
              </div>
            </div>
          </div>

          <div class="mini-card chart">
            <div class="mini-card-head">
              {{ $t("login.dashboard.last7Days") }}
            </div>
            <div class="bar-chart">
              <div v-for="b in weekBars" :key="b.d" class="bar-col">
                <div class="bar" :style="{ height: b.v + '%' }" />
                <div class="bar-label">{{ b.d }}</div>
              </div>
            </div>
          </div>

          <div class="mini-card ring">
            <div class="mini-card-head">
              {{ $t("login.dashboard.fillRate") }}
            </div>
            <div
              class="ring-chart"
              style="--p: 78"
              role="img"
              :aria-label="$t('login.dashboard.fillRateAria')"
            >
              <div class="ring-inner">
                <b>78%</b>
                <span>{{ $t("login.dashboard.occupancy") }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录卡 -->
      <div class="login-card">
        <div class="login-card-logo">
          <div class="brand-mark small">{{ $t("login.brandMark") }}</div>
          <div>
            <div class="welcome-title">
              {{ $t("login.welcomeTitle", { title }) }}
            </div>
            <div class="welcome-sub">{{ $t("login.continueHint") }}</div>
          </div>
        </div>

        <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="loginRules"
          size="large"
          label-position="top"
          @submit.prevent
        >
          <div class="field-label">{{ $t("login.username") }}</div>
          <el-form-item prop="username">
            <el-input
              v-model="ruleForm.username"
              clearable
              :placeholder="$t('login.usernamePlaceholder')"
              :prefix-icon="useRenderIcon(User)"
            />
          </el-form-item>

          <div class="field-label">{{ $t("login.password") }}</div>
          <el-form-item prop="password">
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
              class="forgot-link"
              @click="message($t('login.contactAdminReset'), { type: 'info' })"
            >
              {{ $t("login.forgotPassword") }}
            </span>
          </div>

          <el-checkbox v-model="agreed" class="agree-check">
            {{ $t("login.agreePrefix") }}
            <span class="agreement-link">{{ $t("login.userAgreement") }}</span>
            {{ $t("login.agreeAnd") }}
            <span class="agreement-link">{{ $t("login.privacyPolicy") }}</span>
          </el-checkbox>

          <el-button
            class="login-btn"
            size="large"
            type="primary"
            :loading="loading"
            :disabled="disabled"
            @click="onLogin(ruleFormRef)"
          >
            {{ $t("common.buttons.login") }}
          </el-button>

          <div class="secure-note">
            <el-icon :size="14"><Lock /></el-icon>
            {{ $t("login.secureNote") }}
          </div>

          <div class="demo-tip">
            {{ $t("login.demoAccount") }}
          </div>
        </el-form>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="login-footer">
      <span>{{ $t("login.footerPrivacy") }}</span>
      <i>|</i>
      <span>{{ $t("login.footerTerms") }}</span>
      <i>|</i>
      <span>{{ $t("login.footerHelp") }}</span>
      <span class="copyright">{{ $t("login.copyright") }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 窄屏适配 */
@media (width <= 1100px) {
  .login-body {
    flex-direction: column;
    gap: 32px;
    padding: 72px 20px 16px;
  }

  .brand-panel {
    max-width: 640px;
  }

  .brand-title {
    font-size: 36px;
  }

  .feature-row {
    flex-wrap: wrap;
    gap: 16px;
  }

  .mini-dashboard {
    grid-template-columns: 1fr;
  }

  .login-card {
    flex: none;
    width: 100%;
    max-width: 460px;
  }
}

.login-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  overflow: auto;
  background-color: #eef2f9;
  background-image: radial-gradient(rgb(14 116 144 / 7%) 1px, transparent 1px);
  background-size: 22px 22px;
}

.login-toolbar {
  position: absolute;
  top: 20px;
  right: 24px;
  z-index: 10;
}

.login-body {
  display: flex;
  flex: 1;
  gap: 48px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1440px;
  padding: 48px 48px 16px;
  margin: 0 auto;
}

/* ---------------- 左侧品牌区 ---------------- */
.brand-panel {
  flex: 1 1 0;
  min-width: 0;
  max-width: 760px;
}

.brand-logo {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 36px;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #0e7490, #2aa9cc);
  border-radius: 12px;
  box-shadow: 0 6px 16px -4px rgb(14 116 144 / 45%);

  &.small {
    width: 40px;
    height: 40px;
    font-size: 17px;
  }
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: #0f3547;
  letter-spacing: 1px;
}

.brand-title {
  margin: 0 0 14px;
  font-size: 52px;
  font-weight: 800;
  line-height: 1.15;
  color: #0f3547;
  letter-spacing: 2px;
}

.brand-title-accent {
  background: linear-gradient(90deg, #0e7490, #2aa9cc);
  text-fill-color: transparent;
  background-clip: text;
}

.brand-tagline {
  margin: 0 0 40px;
  font-size: 16px;
  color: #64748b;
}

.feature-row {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  padding: 20px 8px;
  margin-bottom: 28px;
  border-top: 1px solid rgb(14 116 144 / 12%);
  border-bottom: 1px solid rgb(14 116 144 / 12%);
}

.feature-item {
  min-width: 0;
  text-align: center;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: 8px;
  color: #0e7490;
  background: rgb(14 116 144 / 8%);
  border-radius: 10px;
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.feature-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

/* 迷你看板 */
.mini-dashboard {
  display: grid;
  grid-template-columns: 1.1fr 1.6fr 1fr;
  gap: 14px;
}

.mini-card {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e4eaf4;
  border-radius: 14px;
  box-shadow:
    0 1px 2px rgb(16 34 68 / 4%),
    0 8px 20px -8px rgb(16 34 68 / 10%);
}

.mini-card-head {
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.mini-kpi-row {
  display: flex;
  gap: 18px;
  align-items: center;
}

.mini-kpi-num {
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;

  &.blue {
    color: #0e7490;
  }

  &.green {
    color: #10b981;
  }
}

.mini-kpi-label {
  font-size: 12px;
  color: #94a3b8;
}

.mini-kpi-divider {
  width: 1px;
  height: 40px;
  background: #e9edf5;
}

.bar-chart {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  height: 76px;
}

.bar-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  height: 100%;
}

.bar {
  width: 14px;
  margin-top: auto;
  background: linear-gradient(180deg, #2aa9cc, #0e7490);
  border-radius: 4px 4px 0 0;
}

.bar-label {
  font-size: 11px;
  color: #94a3b8;
}

.ring-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  margin: 0 auto;
  background: conic-gradient(
    #0e7490 0 calc(var(--p) * 1%),
    #e4eaf4 calc(var(--p) * 1%) 100%
  );
  border-radius: 50%;
}

.ring-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  background: #fff;
  border-radius: 50%;

  b {
    font-size: 17px;
    color: #0f3547;
  }

  span {
    font-size: 11px;
    color: #94a3b8;
  }
}

/* ---------------- 右侧登录卡 ---------------- */
.login-card {
  flex: 0 0 420px;
  padding: 36px 36px 24px;
  background: #fff;
  border-radius: 18px;
  box-shadow:
    0 2px 6px rgb(16 34 68 / 5%),
    0 24px 60px -16px rgb(16 34 68 / 18%);
}

.login-card-logo {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 26px;
}

.welcome-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f3547;
}

.welcome-sub {
  margin-top: 2px;
  font-size: 13px;
  color: #94a3b8;
}

.field-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-input__wrapper) {
  padding: 4px 14px;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.forgot-link {
  font-size: 13px;
  color: #0e7490;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.agree-check {
  margin-bottom: 18px;

  :deep(.el-checkbox__label) {
    font-size: 13px;
    color: #64748b;
  }
}

.agreement-link {
  color: #0e7490;
  cursor: pointer;
}

.login-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 6px;
  border-radius: 10px;
}

.secure-note {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  font-size: 12px;
  color: #94a3b8;
}

.demo-tip {
  padding: 8px 12px;
  margin-top: 14px;
  font-size: 12px;
  color: #0e7490;
  text-align: center;
  background: rgb(14 116 144 / 6%);
  border-radius: 8px;
}

/* ---------------- 底部 ---------------- */
.login-footer {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
  padding: 18px 0 22px;
  font-size: 13px;
  color: #94a3b8;

  i {
    font-style: normal;
    color: #d3dbe8;
  }

  span:not(.copyright) {
    cursor: pointer;

    &:hover {
      color: #0e7490;
    }
  }

  .copyright {
    margin-left: 12px;
    color: #b0bacb;
  }
}
</style>

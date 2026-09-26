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
    message("请先阅读并同意《用户协议》和《隐私政策》", { type: "warning" });
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
                  message("登录成功", { type: "success" });
                })
                .finally(() => (disabled.value = false));
            });
          } else {
            message("登录失败", { type: "error" });
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
  { icon: Download, title: "入库协同", sub: "预约 · 收货 · 质检" },
  { icon: Upload, title: "出库履约", sub: "波次 · 拣货 · 发运" },
  { icon: BoxIcon, title: "库存管控", sub: "批次 · 序列号 · 效期" },
  { icon: Monitor, title: "设备调度", sub: "AGV · 立库 · 输送线" },
  { icon: DataLine, title: "数据洞察", sub: "看板 · 大屏 · 绩效" }
];

const weekBars = [
  { d: "周一", v: 62 },
  { d: "周二", v: 78 },
  { d: "周三", v: 55 },
  { d: "周四", v: 90 },
  { d: "周五", v: 72 },
  { d: "周六", v: 40 },
  { d: "周日", v: 30 }
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
          <div class="brand-mark">仓</div>
          <span class="brand-name">{{ title }}</span>
        </div>

        <h1 class="brand-title">
          智联仓储<br />
          <span class="brand-title-accent">一体化管理平台</span>
        </h1>
        <p class="brand-tagline">
          让每一件货物的入库、存储、拣选与发运，全程在线、清晰可控
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
            <div class="mini-card-head">今日作业</div>
            <div class="mini-kpi-row">
              <div>
                <div class="mini-kpi-num blue">326</div>
                <div class="mini-kpi-label">入库单</div>
              </div>
              <div class="mini-kpi-divider" />
              <div>
                <div class="mini-kpi-num green">512</div>
                <div class="mini-kpi-label">出库单</div>
              </div>
            </div>
          </div>

          <div class="mini-card chart">
            <div class="mini-card-head">近 7 日出入库量</div>
            <div class="bar-chart">
              <div v-for="b in weekBars" :key="b.d" class="bar-col">
                <div class="bar" :style="{ height: b.v + '%' }" />
                <div class="bar-label">{{ b.d.slice(1) }}</div>
              </div>
            </div>
          </div>

          <div class="mini-card ring">
            <div class="mini-card-head">库区填充率</div>
            <div
              class="ring-chart"
              style="--p: 78"
              role="img"
              aria-label="库区填充率 78%"
            >
              <div class="ring-inner">
                <b>78%</b>
                <span>占用率</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录卡 -->
      <div class="login-card">
        <div class="login-card-logo">
          <div class="brand-mark small">仓</div>
          <div>
            <div class="welcome-title">欢迎登录 {{ title }}</div>
            <div class="welcome-sub">登录以继续</div>
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
          <div class="field-label">账号</div>
          <el-form-item prop="username">
            <el-input
              v-model="ruleForm.username"
              clearable
              placeholder="请输入账号"
              :prefix-icon="useRenderIcon(User)"
            />
          </el-form-item>

          <div class="field-label">密码</div>
          <el-form-item prop="password">
            <el-input
              v-model="ruleForm.password"
              clearable
              show-password
              placeholder="请输入密码"
              :prefix-icon="useRenderIcon(Lock)"
            />
          </el-form-item>

          <div class="form-row">
            <el-checkbox v-model="remember">记住我</el-checkbox>
            <span class="forgot-link" @click="message('请联系管理员重置密码', { type: 'info' })">
              忘记密码?
            </span>
          </div>

          <el-checkbox v-model="agreed" class="agree-check">
            我已阅读并同意
            <span class="agreement-link">《用户协议》</span>
            和
            <span class="agreement-link">《隐私政策》</span>
          </el-checkbox>

          <el-button
            class="login-btn"
            size="large"
            type="primary"
            :loading="loading"
            :disabled="disabled"
            @click="onLogin(ruleFormRef)"
          >
            登 录
          </el-button>

          <div class="secure-note">
            <el-icon :size="14"><Lock /></el-icon>
            安全访问 · 仅限授权用户
          </div>

          <div class="demo-tip">
            演示账号：admin / admin123
          </div>
        </el-form>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="login-footer">
      <span>隐私政策</span>
      <i>|</i>
      <span>使用条款</span>
      <i>|</i>
      <span>帮助</span>
      <span class="copyright">版权所有 © 2026 智联物流集团</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  overflow: auto;
  background-color: #eef2f9;
  background-image: radial-gradient(rgb(37 99 235 / 7%) 1px, transparent 1px);
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
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #4d8bff);
  box-shadow: 0 6px 16px -4px rgb(37 99 235 / 45%);

  &.small {
    width: 40px;
    height: 40px;
    font-size: 17px;
  }
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: #0f2b66;
  letter-spacing: 1px;
}

.brand-title {
  margin: 0 0 14px;
  font-size: 52px;
  font-weight: 800;
  line-height: 1.15;
  color: #0f2b66;
  letter-spacing: 2px;
}

.brand-title-accent {
  background: linear-gradient(90deg, #2563eb, #4d8bff);
  background-clip: text;
  text-fill-color: transparent;
  -webkit-background-clip: text;
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
  border-top: 1px solid rgb(37 99 235 / 12%);
  border-bottom: 1px solid rgb(37 99 235 / 12%);
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
  color: #2563eb;
  border-radius: 10px;
  background: rgb(37 99 235 / 8%);
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
    color: #2563eb;
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
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #4d8bff, #2563eb);
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
  border-radius: 50%;
  background: conic-gradient(
    #2563eb 0 calc(var(--p) * 1%),
    #e4eaf4 calc(var(--p) * 1%) 100%
  );
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
    color: #0f2b66;
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
  color: #0f2b66;
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
  color: #2563eb;
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
  color: #2563eb;
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
  color: #2563eb;
  text-align: center;
  background: rgb(37 99 235 / 6%);
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
      color: #2563eb;
    }
  }

  .copyright {
    margin-left: 12px;
    color: #b0bacb;
  }
}

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
</style>

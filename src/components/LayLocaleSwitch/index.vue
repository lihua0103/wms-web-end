<script setup lang="ts">
import { currentLocale, changeLocale, localeOptions } from "@/plugins/i18n";
import Check from "~icons/ep/check";
import Global from "~icons/ri/global-line";

defineOptions({
  name: "LayLocaleSwitch"
});

function handleCommand(lang: string) {
  changeLocale(lang as "zh-CN" | "en");
}
</script>

<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <span
      class="locale-switch navbar-bg-hover select-none"
      :title="$t('common.language')"
    >
      <IconifyIconOffline :icon="Global" />
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="l in localeOptions"
          :key="l.value"
          :command="l.value"
        >
          <span class="locale-item">
            <IconifyIconOffline
              v-show="l.value === currentLocale"
              :icon="Check"
              class="locale-check"
            />
            <span :class="{ 'font-bold': l.value === currentLocale }">
              {{ l.label }}
            </span>
          </span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.locale-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  font-size: 18px;
  cursor: pointer;
}

.locale-item {
  display: inline-flex;
  gap: 5px;
  align-items: center;

  .locale-check {
    color: var(--el-color-primary);
  }
}
</style>

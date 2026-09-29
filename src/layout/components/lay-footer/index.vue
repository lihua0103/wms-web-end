<script setup lang="ts">
import { getConfig } from "@/config";
import { $t } from "@/plugins/i18n";

defineOptions({
  name: "LayFooter"
});

const Title = $t("app.title");
const version = getConfig()?.Version ?? "";
const year = new Date().getFullYear();
</script>

<template>
  <footer
    class="layout-footer text-[rgba(0,0,0,0.45)] dark:text-[rgba(220,220,242,0.65)]"
  >
    <span>
      {{ $t("app.footerCopyright", { year, title: Title }) }}
      <span v-if="version" class="footer-version">v{{ version }}</span>
    </span>
  </footer>
</template>

<style lang="scss" scoped>
.layout-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 0 8px;
  font-size: 13px;

  .footer-version {
    margin-left: 8px;
    color: var(--el-text-color-secondary);
  }
}
</style>

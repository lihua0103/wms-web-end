<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { ElConfigProvider } from "element-plus";
import { ReDialog } from "@/components/ReDialog";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import { currentLocale } from "@/plugins/i18n";

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog
  },
  setup() {
    // element-plus 组件内置文案（分页、日期选择器等）跟随平台语言
    const elementLocale = computed(() =>
      currentLocale.value === "en" ? en : zhCn
    );
    return { elementLocale };
  }
});
</script>

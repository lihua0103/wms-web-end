import { ref } from "vue";

/**
 * ECharts 明暗模式主题工具
 * pure-admin 的主题机制通过 html.dark 类切换 element-plus 暗色变量，
 * 这里监听该类并让图表配色一律取 CSS 令牌，明暗切换后重建图表即可。
 */

/** html.dark 的共享响应式引用（应用级单例） */
export const isDark = ref(document.documentElement.classList.contains("dark"));

new MutationObserver(() => {
  isDark.value = document.documentElement.classList.contains("dark");
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"]
});

/** 读取 element-plus 令牌当前值（:root / html.dark 上定义） */
export function chartVar(name: string, fallback = "#999"): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/** 图表通用配色：坐标轴/图例/提示框跟随明暗模式 */
export function chartPalette() {
  return {
    axisLine: chartVar("--el-border-color", "#dcdfe6"),
    axisLabel: chartVar("--el-text-color-secondary", "#909399"),
    splitLine: chartVar("--el-border-color-lighter", "#ebeef5"),
    legendText: chartVar("--el-text-color-secondary", "#909399"),
    textColor: chartVar("--el-text-color-primary", "#303133"),
    tooltipBg: chartVar("--el-bg-color", "#fff"),
    tooltipBorder: chartVar("--el-border-color-light", "#e4e7ed"),
    /** 饼图描边与卡片底色一致，环切片之间呈现"缝隙" */
    cardBg: chartVar("--el-bg-color", "#fff")
  };
}

/** tooltip 公共配置（trigger 由调用方按需指定） */
export function chartTooltip(trigger: "item" | "axis" = "axis") {
  const p = chartPalette();
  return {
    trigger,
    backgroundColor: p.tooltipBg,
    borderColor: p.tooltipBorder,
    textStyle: { color: p.textColor }
  };
}

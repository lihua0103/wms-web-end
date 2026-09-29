import {
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch
} from "vue";
import * as echarts from "echarts";
import { getDashboardData } from "@/api/report";
import type { DashboardData } from "@/api/report";
import { $t } from "@/plugins/i18n";
import { isDark, chartPalette, chartTooltip } from "@/utils/chart-theme";

export function useReportDashboard() {
  const data = ref<DashboardData>();

  const categoryRef = ref<HTMLElement>();
  const warehouseRef = ref<HTMLElement>();
  const ageRef = ref<HTMLElement>();
  const turnoverRef = ref<HTMLElement>();

  let categoryChart: echarts.ECharts | null = null;
  let warehouseChart: echarts.ECharts | null = null;
  let ageChart: echarts.ECharts | null = null;
  let turnoverChart: echarts.ECharts | null = null;

  const statCards = computed(() => {
    const s = data.value?.stockSummary;
    return [
      {
        title: $t("report.dashboard.totalQty"),
        value: s ? s.totalQty.toLocaleString() : "-"
      },
      {
        title: $t("report.dashboard.totalValue"),
        value: s ? s.totalValue.toLocaleString() : "-"
      },
      {
        title: $t("report.dashboard.skuCount"),
        value: s ? s.skuCount.toLocaleString() : "-"
      },
      {
        title: $t("report.dashboard.warningCount"),
        value: s ? s.warningCount.toLocaleString() : "-"
      }
    ];
  });

  function initCharts() {
    /** 图表配色取 element-plus 令牌，随明暗模式自动切换 */
    const p = chartPalette();
    const axisStyles = {
      axisLine: { lineStyle: { color: p.axisLine } },
      axisLabel: { color: p.axisLabel }
    };
    if (categoryRef.value && data.value) {
      categoryChart = echarts.init(categoryRef.value);
      categoryChart.setOption({
        tooltip: chartTooltip("axis"),
        grid: { left: 70, right: 20, top: 30, bottom: 30 },
        xAxis: {
          type: "category",
          data: data.value.categoryStock.map(i => i.name),
          ...axisStyles
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: p.splitLine } },
          ...axisStyles
        },
        series: [
          {
            type: "bar",
            barWidth: "45%",
            data: data.value.categoryStock.map(i => i.value),
            itemStyle: { color: "#0e7490", borderRadius: [4, 4, 0, 0] }
          }
        ]
      });
    }
    if (warehouseRef.value && data.value) {
      warehouseChart = echarts.init(warehouseRef.value);
      warehouseChart.setOption({
        tooltip: chartTooltip("item"),
        legend: { bottom: 0, textStyle: { color: p.legendText } },
        series: [
          {
            type: "pie",
            radius: ["40%", "65%"],
            center: ["50%", "45%"],
            data: data.value.warehouseStock,
            label: { formatter: "{b}: {c}", color: p.axisLabel }
          }
        ]
      });
    }
    if (ageRef.value && data.value) {
      ageChart = echarts.init(ageRef.value);
      ageChart.setOption({
        tooltip: chartTooltip("axis"),
        grid: { left: 70, right: 20, top: 30, bottom: 30 },
        xAxis: {
          type: "category",
          data: data.value.stockAge.map(i => i.name),
          ...axisStyles
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: p.splitLine } },
          ...axisStyles
        },
        series: [
          {
            type: "bar",
            barWidth: "45%",
            data: data.value.stockAge.map(i => i.value),
            itemStyle: { color: "#e6a23c", borderRadius: [4, 4, 0, 0] }
          }
        ]
      });
    }
    if (turnoverRef.value && data.value) {
      turnoverChart = echarts.init(turnoverRef.value);
      // 升序排列，y 轴自下而上渲染后 Top1 显示在最上方
      const top = [...data.value.turnoverTop].sort(
        (a, b) => a.turnover - b.turnover
      );
      turnoverChart.setOption({
        tooltip: chartTooltip("axis"),
        grid: { left: 90, right: 40, top: 30, bottom: 30 },
        xAxis: {
          type: "value",
          splitLine: { lineStyle: { color: p.splitLine } },
          ...axisStyles
        },
        yAxis: {
          type: "category",
          data: top.map(i => i.name),
          ...axisStyles
        },
        series: [
          {
            type: "bar",
            barWidth: 12,
            data: top.map(i => i.turnover),
            itemStyle: { color: "#67c23a", borderRadius: [0, 4, 4, 0] }
          }
        ]
      });
    }
  }

  function disposeCharts() {
    categoryChart?.dispose();
    warehouseChart?.dispose();
    ageChart?.dispose();
    turnoverChart?.dispose();
    categoryChart = warehouseChart = ageChart = turnoverChart = null;
  }

  function resizeCharts() {
    categoryChart?.resize();
    warehouseChart?.resize();
    ageChart?.resize();
    turnoverChart?.resize();
  }

  onMounted(async () => {
    const { data: res } = await getDashboardData();
    data.value = res;
    await nextTick();
    initCharts();
    window.addEventListener("resize", resizeCharts);
  });

  /** 明暗模式切换：取新令牌重建图表 */
  watch(isDark, () => {
    nextTick(() => {
      disposeCharts();
      initCharts();
    });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeCharts);
    disposeCharts();
  });

  return {
    statCards,
    categoryRef,
    warehouseRef,
    ageRef,
    turnoverRef
  };
}

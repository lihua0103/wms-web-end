import { computed, ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import { getDashboardData } from "@/api/report";
import type { DashboardData } from "@/api/report";

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
      { title: "库存总量", value: s ? s.totalQty.toLocaleString() : "-" },
      { title: "库存总值（元）", value: s ? s.totalValue.toLocaleString() : "-" },
      { title: "在库 SKU 数", value: s ? s.skuCount.toLocaleString() : "-" },
      { title: "库存预警数", value: s ? s.warningCount.toLocaleString() : "-" }
    ];
  });

  function initCharts() {
    if (categoryRef.value && data.value) {
      categoryChart = echarts.init(categoryRef.value);
      categoryChart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: 70, right: 20, top: 30, bottom: 30 },
        xAxis: { type: "category", data: data.value.categoryStock.map(i => i.name) },
        yAxis: { type: "value" },
        series: [
          {
            type: "bar",
            barWidth: "45%",
            data: data.value.categoryStock.map(i => i.value),
            itemStyle: { color: "#409eff", borderRadius: [4, 4, 0, 0] }
          }
        ]
      });
    }
    if (warehouseRef.value && data.value) {
      warehouseChart = echarts.init(warehouseRef.value);
      warehouseChart.setOption({
        tooltip: { trigger: "item" },
        legend: { bottom: 0 },
        series: [
          {
            type: "pie",
            radius: ["40%", "65%"],
            center: ["50%", "45%"],
            data: data.value.warehouseStock,
            label: { formatter: "{b}: {c}" }
          }
        ]
      });
    }
    if (ageRef.value && data.value) {
      ageChart = echarts.init(ageRef.value);
      ageChart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: 70, right: 20, top: 30, bottom: 30 },
        xAxis: { type: "category", data: data.value.stockAge.map(i => i.name) },
        yAxis: { type: "value" },
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
      const top = [...data.value.turnoverTop].sort((a, b) => a.turnover - b.turnover);
      turnoverChart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: 90, right: 40, top: 30, bottom: 30 },
        xAxis: { type: "value" },
        yAxis: { type: "category", data: top.map(i => i.name) },
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

  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeCharts);
    categoryChart?.dispose();
    warehouseChart?.dispose();
    ageChart?.dispose();
    turnoverChart?.dispose();
  });

  return {
    statCards,
    categoryRef,
    warehouseRef,
    ageRef,
    turnoverRef
  };
}

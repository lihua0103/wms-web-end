import { computed, ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import { getScreenData } from "@/api/report";
import type { ScreenData } from "@/api/report";

const AXIS_LABEL_COLOR = "#8ea0c0";
const AXIS_LINE_COLOR = "rgba(140, 160, 200, 0.4)";
const SPLIT_LINE_COLOR = "rgba(140, 160, 200, 0.15)";

export function useReportScreen() {
  const data = ref<ScreenData>();

  const flowRef = ref<HTMLElement>();
  const zoneRef = ref<HTMLElement>();
  let flowChart: echarts.ECharts | null = null;
  let zoneChart: echarts.ECharts | null = null;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const metricCards = computed(() => [
    { title: "今日入库量", value: data.value ? data.value.todayInbound.toLocaleString() : "-", color: "#409eff" },
    { title: "今日出库量", value: data.value ? data.value.todayOutbound.toLocaleString() : "-", color: "#67c23a" },
    { title: "在线设备", value: data.value ? data.value.onlineDevices.toLocaleString() : "-", color: "#e6a23c" },
    { title: "待处理任务", value: data.value ? data.value.taskPending.toLocaleString() : "-", color: "#f56c6c" }
  ]);

  /** 告警等级对应节点颜色 */
  function alarmColor(level: string) {
    if (level === "high") return "#f56c6c";
    if (level === "medium") return "#e6a23c";
    return "#409eff";
  }

  function renderCharts() {
    if (flowRef.value && data.value) {
      if (!flowChart) flowChart = echarts.init(flowRef.value);
      flowChart.setOption(
        {
          tooltip: { trigger: "axis" },
          legend: {
            data: ["入库", "出库"],
            bottom: 0,
            textStyle: { color: AXIS_LABEL_COLOR }
          },
          grid: { left: 50, right: 20, top: 30, bottom: 40 },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: data.value.hourlyFlow.map(h => h.hour),
            axisLine: { lineStyle: { color: AXIS_LINE_COLOR } },
            axisLabel: { color: AXIS_LABEL_COLOR }
          },
          yAxis: {
            type: "value",
            splitLine: { lineStyle: { color: SPLIT_LINE_COLOR } },
            axisLabel: { color: AXIS_LABEL_COLOR }
          },
          series: [
            {
              name: "入库",
              type: "line",
              smooth: true,
              symbol: "none",
              data: data.value.hourlyFlow.map(h => h.inbound),
              itemStyle: { color: "#409eff" },
              areaStyle: { opacity: 0.25 }
            },
            {
              name: "出库",
              type: "line",
              smooth: true,
              symbol: "none",
              data: data.value.hourlyFlow.map(h => h.outbound),
              itemStyle: { color: "#34d399" },
              areaStyle: { opacity: 0.25 }
            }
          ]
        },
        true
      );
    }
    if (zoneRef.value && data.value) {
      if (!zoneChart) zoneChart = echarts.init(zoneRef.value);
      // 升序排列，y 轴自下而上渲染后填充率最高者显示在最上方
      const rows = [...data.value.zoneFill].sort((a, b) => a.percent - b.percent);
      zoneChart.setOption(
        {
          tooltip: { trigger: "axis", formatter: "{b}：{c}%" },
          grid: { left: 90, right: 60, top: 20, bottom: 20 },
          xAxis: {
            type: "value",
            max: 100,
            splitLine: { lineStyle: { color: SPLIT_LINE_COLOR } },
            axisLabel: { color: AXIS_LABEL_COLOR, formatter: "{value}%" }
          },
          yAxis: {
            type: "category",
            data: rows.map(r => r.name),
            axisLine: { lineStyle: { color: AXIS_LINE_COLOR } },
            axisLabel: { color: "#c6d4f0" }
          },
          series: [
            {
              type: "bar",
              barWidth: 14,
              data: rows.map(r => r.percent),
              itemStyle: { color: "#409eff", borderRadius: [0, 4, 4, 0] },
              label: {
                show: true,
                position: "right",
                color: "#c6d4f0",
                formatter: "{c}%"
              }
            }
          ]
        },
        true
      );
    }
  }

  function resizeCharts() {
    flowChart?.resize();
    zoneChart?.resize();
  }

  onMounted(async () => {
    const { data: res } = await getScreenData();
    data.value = res;
    await nextTick();
    renderCharts();
    window.addEventListener("resize", resizeCharts);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeCharts);
    flowChart?.dispose();
    zoneChart?.dispose();
    flowChart = null;
    zoneChart = null;
  });

  return {
    data,
    today,
    metricCards,
    alarmColor,
    flowRef,
    zoneRef
  };
}

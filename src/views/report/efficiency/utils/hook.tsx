import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import { getEfficiencyReport } from "@/api/report";
import type { PersonEfficiency, TypeCountItem } from "@/api/report";
import { $t } from "@/plugins/i18n";

export function useReportEfficiency() {
  const loading = ref(false);
  const personList = ref<PersonEfficiency[]>([]);
  const typeList = ref<TypeCountItem[]>([]);

  const pieRef = ref<HTMLElement>();
  const barRef = ref<HTMLElement>();
  let pieChart: echarts.ECharts | null = null;
  let barChart: echarts.ECharts | null = null;

  const columns: TableColumnList = [
    {
      label: $t("report.efficiency.rank"),
      minWidth: 60,
      cellRenderer: ({ index }) => `${index + 1}`
    },
    { label: $t("report.efficiency.person"), prop: "name", minWidth: 100 },
    {
      label: $t("report.efficiency.taskCount"),
      prop: "taskCount",
      minWidth: 90
    },
    {
      label: $t("report.efficiency.avgMinutes"),
      prop: "avgMinutes",
      minWidth: 120
    },
    {
      label: $t("report.efficiency.errorRate"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <span style={row.errorRate >= 0.05 ? "color:#f56c6c" : ""}>
          {(row.errorRate * 100).toFixed(1)}%
        </span>
      )
    }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getEfficiencyReport();
      // 双保险：前端再按任务数降序
      personList.value = [...data.personList].sort(
        (a, b) => b.taskCount - a.taskCount
      );
      typeList.value = data.typeList;
    } finally {
      loading.value = false;
    }
    await nextTick();
    renderCharts();
  }

  function renderCharts() {
    if (pieRef.value) {
      if (!pieChart) pieChart = echarts.init(pieRef.value);
      pieChart.setOption(
        {
          tooltip: { trigger: "item" },
          legend: { bottom: 0 },
          series: [
            {
              type: "pie",
              radius: ["40%", "65%"],
              center: ["50%", "45%"],
              data: typeList.value.map(t => ({ name: t.type, value: t.count })),
              label: { formatter: "{b}: {c}" }
            }
          ]
        },
        true
      );
    }
    if (barRef.value) {
      if (!barChart) barChart = echarts.init(barRef.value);
      // 升序排列，y 轴自下而上渲染后任务数最多者显示在最上方
      const sorted = [...personList.value].sort(
        (a, b) => a.taskCount - b.taskCount
      );
      barChart.setOption(
        {
          tooltip: { trigger: "axis" },
          grid: { left: 70, right: 40, top: 30, bottom: 30 },
          xAxis: { type: "value" },
          yAxis: { type: "category", data: sorted.map(p => p.name) },
          series: [
            {
              type: "bar",
              barWidth: 14,
              data: sorted.map(p => p.taskCount),
              itemStyle: { color: "#0e7490", borderRadius: [0, 4, 4, 0] }
            }
          ]
        },
        true
      );
    }
  }

  function resizeCharts() {
    pieChart?.resize();
    barChart?.resize();
  }

  onMounted(() => {
    window.addEventListener("resize", resizeCharts);
    onSearch();
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeCharts);
    pieChart?.dispose();
    barChart?.dispose();
    pieChart = null;
    barChart = null;
  });

  return {
    loading,
    personList,
    columns,
    pieRef,
    barRef
  };
}

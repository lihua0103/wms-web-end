import { reactive, ref, onMounted, onBeforeUnmount } from "vue";
import type { TableColumnCtx } from "element-plus";
import * as echarts from "echarts";
import { getInoutReport } from "@/api/report";
import type { InoutReport, InoutTotal } from "@/api/report";
import { $t } from "@/plugins/i18n";

function fmtDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function useReportInout() {
  const loading = ref(false);
  const report = ref<InoutReport>({
    list: [],
    total: {
      inboundQty: 0,
      outboundQty: 0,
      inboundAmount: 0,
      outboundAmount: 0
    }
  });

  const form = reactive({
    dateRange: [
      fmtDay(new Date(Date.now() - 29 * 86400000)),
      fmtDay(new Date())
    ] as string[],
    warehouseCode: ""
  });

  const trendRef = ref<HTMLElement>();
  let trendChart: echarts.ECharts | null = null;

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getInoutReport({
        startDate: form.dateRange?.[0],
        endDate: form.dateRange?.[1],
        warehouseCode: form.warehouseCode
      });
      report.value = data;
    } finally {
      loading.value = false;
    }
    renderChart();
  }

  function resetForm(formEl: { resetFields: () => void }) {
    formEl.resetFields();
    onSearch();
  }

  function renderChart() {
    if (!trendRef.value) return;
    if (!trendChart) trendChart = echarts.init(trendRef.value);
    const rows = report.value.list;
    trendChart.setOption(
      {
        tooltip: { trigger: "axis" },
        legend: {
          data: [$t("report.inout.inboundQty"), $t("report.inout.outboundQty")],
          bottom: 0
        },
        grid: { left: 70, right: 30, top: 30, bottom: 40 },
        xAxis: { type: "category", data: rows.map(r => r.date) },
        yAxis: { type: "value" },
        series: [
          {
            name: $t("report.inout.inboundQty"),
            type: "line",
            smooth: true,
            data: rows.map(r => r.inboundQty),
            itemStyle: { color: "#0e7490" },
            areaStyle: { opacity: 0.15 }
          },
          {
            name: $t("report.inout.outboundQty"),
            type: "line",
            smooth: true,
            data: rows.map(r => r.outboundQty),
            itemStyle: { color: "#67c23a" },
            areaStyle: { opacity: 0.15 }
          }
        ]
      },
      true
    );
  }

  /** 汇总行：日期列显示"合计"，其余列取 total */
  function summaryMethod({ columns }: { columns: TableColumnCtx<any>[] }) {
    return columns.map((col, i) => {
      if (i === 0) return $t("common.columns.total");
      const key = col.property as keyof InoutTotal;
      const val = key
        ? (report.value.total as Record<string, number>)[key]
        : undefined;
      if (val === undefined || val === null) return "";
      return key.includes("Amount")
        ? Number(val).toFixed(2)
        : Number(val).toLocaleString();
    });
  }

  /** el-table-column 金额格式化 */
  function formatAmount(_row: any, _col: any, val: number | string) {
    return Number(val).toFixed(2);
  }

  /** el-table-column 数量格式化 */
  function formatQty(_row: any, _col: any, val: number | string) {
    return Number(val).toLocaleString();
  }

  function resizeChart() {
    trendChart?.resize();
  }

  onMounted(() => {
    window.addEventListener("resize", resizeChart);
    onSearch();
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeChart);
    trendChart?.dispose();
    trendChart = null;
  });

  return {
    loading,
    report,
    form,
    trendRef,
    onSearch,
    resetForm,
    summaryMethod,
    formatAmount,
    formatQty
  };
}

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch
} from "vue";
import { useRouter } from "vue-router";
import * as echarts from "echarts";
import { Download, Upload, Box, Coin } from "@element-plus/icons-vue";
import { getDashboardStats } from "@/api/system";
import { $t, transformI18n } from "@/plugins/i18n";
import type { DashboardStats } from "@/api/system";
import { isDark, chartPalette, chartTooltip } from "@/utils/chart-theme";

defineOptions({ name: "Welcome" });

const router = useRouter();
const stats = ref<DashboardStats>();
const trendRef = ref<HTMLElement>();
const pieRef = ref<HTMLElement>();
let trendChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

interface KpiCard {
  title: string;
  value?: number;
  delta?: number;
  icon: any;
  tone: "blue" | "green" | "orange" | "red";
  unit?: string;
}

const kpiCards = ref<KpiCard[]>([]);

/** 图表用色：远航青 × 国际橙 双色调（国际物流平台的活力配色） */
const PRIMARY = "#0E7490";
const ACCENT = "#F97316";
const PIE_PALETTE = [
  "#0E7490",
  "#F97316",
  "#6366F1",
  "#22B8CF",
  "#8B5CF6",
  "#94A3B8"
];

const todayText = computed(() => {
  const now = new Date();
  const weekKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return $t("welcome.dateFull", {
    y: now.getFullYear(),
    m: now.getMonth() + 1,
    d: now.getDate(),
    w: $t(`welcome.weekday.${weekKeys[now.getDay()]}`)
  });
});

/** 快捷入口 */
const quickActions = [
  {
    title: $t("welcome.quick.inboundAsn"),
    path: "/inbound/asn",
    icon: Download,
    tone: "blue"
  },
  {
    title: $t("welcome.quick.createOutbound"),
    path: "/outbound/order",
    icon: Upload,
    tone: "green"
  },
  {
    title: $t("welcome.quick.stocktake"),
    path: "/inventory/stocktake",
    icon: Box,
    tone: "orange"
  },
  {
    title: $t("welcome.quick.ledger"),
    path: "/inventory/ledger",
    icon: Coin,
    tone: "red"
  }
];

function initCharts() {
  if (trendRef.value && stats.value) {
    /** 图表配色取 element-plus 令牌，随明暗模式自动切换 */
    const p = chartPalette();
    trendChart = echarts.init(trendRef.value);
    trendChart.setOption({
      tooltip: chartTooltip("axis"),
      legend: {
        data: [$t("welcome.chart.inbound"), $t("welcome.chart.outbound")],
        bottom: 0,
        icon: "roundRect",
        textStyle: { color: p.legendText }
      },
      grid: { left: 44, right: 16, top: 30, bottom: 44 },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: stats.value.trend.map(t => t.date),
        axisLine: { lineStyle: { color: p.axisLine } },
        axisLabel: { color: p.axisLabel }
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: p.splitLine } },
        axisLabel: { color: p.axisLabel }
      },
      series: [
        {
          name: $t("welcome.chart.inbound"),
          type: "line",
          smooth: true,
          symbolSize: 5,
          data: stats.value.trend.map(t => t.inbound),
          itemStyle: { color: PRIMARY },
          lineStyle: { width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(14,116,144,0.10)" },
              { offset: 1, color: "rgba(14,116,144,0)" }
            ])
          }
        },
        {
          name: $t("welcome.chart.outbound"),
          type: "line",
          smooth: true,
          symbolSize: 5,
          data: stats.value.trend.map(t => t.outbound),
          itemStyle: { color: ACCENT },
          lineStyle: { width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(249,115,22,0.12)" },
              { offset: 1, color: "rgba(249,115,22,0)" }
            ])
          }
        }
      ]
    });
  }
  if (pieRef.value && stats.value) {
    const p = chartPalette();
    pieChart = echarts.init(pieRef.value);
    pieChart.setOption({
      tooltip: chartTooltip("item"),
      legend: {
        bottom: 0,
        icon: "circle",
        textStyle: { color: p.legendText }
      },
      color: PIE_PALETTE,
      series: [
        {
          type: "pie",
          radius: ["48%", "70%"],
          center: ["50%", "44%"],
          itemStyle: {
            borderRadius: 4,
            borderColor: p.cardBg,
            borderWidth: 2
          },
          label: { show: false },
          data: stats.value.warehouseStock.map(w => ({
            ...w,
            name: transformI18n(w.name)
          })),
          emphasis: {
            label: {
              show: true,
              formatter: "{b}\n{c}",
              fontWeight: 600,
              color: p.textColor
            }
          }
        }
      ]
    });
  }
}

function resizeCharts() {
  trendChart?.resize();
  pieChart?.resize();
}

/** 明暗模式切换：取新令牌重建图表 */
watch(isDark, () => {
  nextTick(() => {
    trendChart?.dispose();
    pieChart?.dispose();
    trendChart = null;
    pieChart = null;
    initCharts();
  });
});

onMounted(async () => {
  const { data } = await getDashboardStats();
  stats.value = data;
  kpiCards.value = [
    {
      title: $t("welcome.kpi.inbound"),
      value: data.todayInboundCount,
      delta: data.deltas?.inbound,
      icon: Download,
      tone: "blue",
      unit: $t("welcome.unit.orders")
    },
    {
      title: $t("welcome.kpi.outbound"),
      value: data.todayOutboundCount,
      delta: data.deltas?.outbound,
      icon: Upload,
      tone: "green",
      unit: $t("welcome.unit.orders")
    },
    {
      title: $t("welcome.kpi.sku"),
      value: data.totalSku,
      delta: data.deltas?.sku,
      icon: Box,
      tone: "orange",
      unit: $t("welcome.unit.kinds")
    },
    {
      title: $t("welcome.kpi.stock"),
      value: data.stockQty,
      delta: data.deltas?.stock,
      icon: Coin,
      tone: "red",
      unit: $t("welcome.unit.pieces")
    }
  ];
  await nextTick();
  initCharts();
  window.addEventListener("resize", resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeCharts);
  trendChart?.dispose();
  pieChart?.dispose();
});
</script>

<template>
  <div class="p-3">
    <!-- 页头 -->
    <div class="page-head">
      <div>
        <h2>{{ $t("welcome.title") }}</h2>
        <p>{{ todayText }} · {{ $t("welcome.allNormal") }}</p>
      </div>
    </div>

    <!-- KPI 指标卡 -->
    <el-row :gutter="12" class="mb-3">
      <el-col v-for="card in kpiCards" :key="card.title" :xs="12" :sm="6">
        <div class="wms-kpi-card p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="wms-kpi-title">{{ card.title }}</div>
              <div class="wms-kpi-value mt-2">
                {{ card.value?.toLocaleString() ?? "-" }}
                <span class="wms-kpi-unit">{{ card.unit }}</span>
              </div>
              <div v-if="card.delta !== undefined" class="mt-1 text-xs">
                <span :class="card.delta >= 0 ? 'v-success' : 'v-danger'">
                  {{ card.delta >= 0 ? "↑" : "↓" }}
                  {{ Math.abs(card.delta) }}%
                </span>
                <span class="v-dim ml-1">{{ $t("welcome.vsYesterday") }}</span>
              </div>
            </div>
            <div class="wms-kpi-icon" :class="card.tone">
              <el-icon :size="22">
                <component :is="card.icon" />
              </el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 待办事项：登录后第一优先级 -->
    <el-row :gutter="12" class="mb-3">
      <el-col :span="24">
        <el-card
          shadow="never"
          class="todo-card"
          :header="$t('welcome.todoTitle')"
        >
          <el-row :gutter="12">
            <el-col
              v-for="todo in stats?.todos || []"
              :key="todo.title"
              :xs="12"
              :sm="6"
            >
              <div class="todo-item" @click="router.push(todo.path)">
                <div class="v-secondary text-sm">
                  {{ transformI18n(todo.title) }}
                </div>
                <div class="text-xl font-semibold mt-1 tabular-nums">
                  <span :class="todo.count > 0 ? 'v-danger' : 'v-success'">{{
                    todo.count
                  }}</span>
                  <span class="v-dim text-xs ml-1">{{
                    $t("welcome.todoPending")
                  }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="12" class="mb-3">
      <el-col :span="24">
        <el-card
          shadow="never"
          :header="$t('welcome.quickTitle')"
          body-style="padding: 12px 16px"
        >
          <div class="flex flex-wrap gap-2.5">
            <div
              v-for="action in quickActions"
              :key="action.title"
              class="quick-action"
              @click="router.push(action.path)"
            >
              <el-icon :size="15" :class="`tone-${action.tone}`"
                ><component :is="action.icon"
              /></el-icon>
              {{ action.title }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="12" class="mb-3">
      <el-col :xs="24" :lg="16">
        <el-card shadow="never" :header="$t('welcome.trendTitle')">
          <div ref="trendRef" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="never" :header="$t('welcome.stockTitle')">
          <div ref="pieRef" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
/* 语义文字色：走 element-plus 令牌，明暗模式自动切换 */
.v-success {
  color: var(--el-color-success);
}

.v-danger {
  color: var(--el-color-danger);
}

.v-secondary {
  color: var(--el-text-color-secondary);
}

.v-dim {
  color: var(--el-text-color-placeholder);
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--wms-text-title);
    letter-spacing: 0.3px;
  }

  p {
    margin: 4px 0 0;
    font-size: 12.5px;
    color: var(--wms-text-secondary);
  }
}

.wms-kpi-unit {
  margin-left: 2px;
  font-size: 12px;
  font-weight: 400;
  color: var(--wms-text-secondary);
}

.quick-action {
  display: inline-flex;
  align-items: center;
  padding: 9px 16px;
  font-size: 13.5px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--wms-card);
  border: 1px solid var(--wms-border);
  border-radius: 8px;
  transition: all 0.2s;

  .el-icon {
    margin-right: 7px;

    &.tone-blue {
      color: #0e7490;
    }

    &.tone-green {
      color: #059669;
    }

    &.tone-orange {
      color: #f97316;
    }

    &.tone-red {
      color: #dc2626;
    }
  }

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    box-shadow: 0 3px 10px -3px rgb(14 116 144 / 25%);
    transform: translateY(-1px);
  }
}

.todo-item {
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}
</style>

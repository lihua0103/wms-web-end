<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import * as echarts from "echarts";
import { Download, Upload, Box, Coin } from "@element-plus/icons-vue";
import { getDashboardStats } from "@/api/system";
import type { DashboardStats } from "@/api/system";

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

/** 快捷入口 */
const quickActions = [
  { title: "入库预约", path: "/inbound/asn", icon: Download, tone: "blue" },
  { title: "创建出库单", path: "/outbound/order", icon: Upload, tone: "green" },
  { title: "库存盘点", path: "/inventory/stocktake", icon: Box, tone: "orange" },
  { title: "库存查询", path: "/inventory/ledger", icon: Coin, tone: "red" }
];

function initCharts() {
  if (trendRef.value && stats.value) {
    trendChart = echarts.init(trendRef.value);
    trendChart.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: ["入库", "出库"], bottom: 0, icon: "roundRect" },
      grid: { left: 44, right: 16, top: 30, bottom: 44 },
      xAxis: {
        type: "category",
        data: stats.value.trend.map(t => t.date),
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisLabel: { color: "#64748b" }
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#eef1f7" } },
        axisLabel: { color: "#64748b" }
      },
      series: [
        {
          name: "入库",
          type: "line",
          smooth: true,
          symbolSize: 6,
          data: stats.value.trend.map(t => t.inbound),
          itemStyle: { color: "#2563eb" },
          lineStyle: { width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(37,99,235,0.18)" },
              { offset: 1, color: "rgba(37,99,235,0)" }
            ])
          }
        },
        {
          name: "出库",
          type: "line",
          smooth: true,
          symbolSize: 6,
          data: stats.value.trend.map(t => t.outbound),
          itemStyle: { color: "#10b981" },
          lineStyle: { width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(16,185,129,0.16)" },
              { offset: 1, color: "rgba(16,185,129,0)" }
            ])
          }
        }
      ]
    });
  }
  if (pieRef.value && stats.value) {
    pieChart = echarts.init(pieRef.value);
    pieChart.setOption({
      tooltip: { trigger: "item" },
      legend: { bottom: 0, icon: "circle" },
      color: ["#2563eb", "#10b981", "#f59e0b"],
      series: [
        {
          type: "pie",
          radius: ["48%", "70%"],
          center: ["50%", "44%"],
          itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
          label: { show: false },
          data: stats.value.warehouseStock,
          emphasis: {
            label: {
              show: true,
              formatter: "{b}\n{c}",
              fontWeight: 600
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

onMounted(async () => {
  const { data } = await getDashboardStats();
  stats.value = data;
  kpiCards.value = [
    {
      title: "今日入库单",
      value: data.todayInboundCount,
      delta: data.deltas?.inbound,
      icon: Download,
      tone: "blue",
      unit: "单"
    },
    {
      title: "今日出库单",
      value: data.todayOutboundCount,
      delta: data.deltas?.outbound,
      icon: Upload,
      tone: "green",
      unit: "单"
    },
    {
      title: "在库物料 SKU",
      value: data.totalSku,
      delta: data.deltas?.sku,
      icon: Box,
      tone: "orange",
      unit: "种"
    },
    {
      title: "库存总量",
      value: data.stockQty,
      delta: data.deltas?.stock,
      icon: Coin,
      tone: "red",
      unit: "件"
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
  <div class="p-2">
    <!-- KPI 指标卡 -->
    <el-row :gutter="12" class="mb-3">
      <el-col v-for="card in kpiCards" :key="card.title" :xs="12" :sm="6">
        <div class="wms-kpi-card bg-white p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="wms-kpi-title">{{ card.title }}</div>
              <div class="wms-kpi-value mt-2">
                {{ card.value?.toLocaleString() ?? "-" }}
                <span class="wms-kpi-unit">{{ card.unit }}</span>
              </div>
              <div v-if="card.delta !== undefined" class="mt-1 text-xs">
                <span :class="card.delta >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'">
                  {{ card.delta >= 0 ? "↑" : "↓" }}
                  {{ Math.abs(card.delta) }}%
                </span>
                <span class="text-[#94a3b8] ml-1">较昨日</span>
              </div>
            </div>
            <div class="wms-kpi-icon" :class="card.tone">
              <el-icon :size="24">
                <component :is="card.icon" />
              </el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="12" class="mb-3">
      <el-col :span="24">
        <el-card shadow="never" header="快捷操作" body-style="padding: 14px 20px">
          <div class="flex flex-wrap gap-3">
            <div
              v-for="action in quickActions"
              :key="action.title"
              class="quick-action"
              @click="router.push(action.path)"
            >
              <el-icon :size="18" class="mr-2 text-[#2563eb]">
                <component :is="action.icon" />
              </el-icon>
              {{ action.title }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="12" class="mb-3">
      <el-col :xs="24" :lg="16">
        <el-card shadow="never" header="近 7 天出入库趋势">
          <div ref="trendRef" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="never" header="各仓库库存占比">
          <div ref="pieRef" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项 -->
    <el-row :gutter="12">
      <el-col :span="24">
        <el-card shadow="never" header="待办事项">
          <el-row :gutter="12">
            <el-col v-for="todo in stats?.todos || []" :key="todo.title" :xs="12" :sm="6">
              <div class="todo-item" @click="router.push(todo.path)">
                <div class="text-[#64748b] text-sm">{{ todo.title }}</div>
                <div class="text-xl font-semibold mt-1 tabular-nums">
                  <span :class="todo.count > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'">
                    {{ todo.count }}
                  </span>
                  <span class="text-xs text-[#94a3b8] ml-1">项待处理</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.wms-kpi-unit {
  font-size: 12px;
  font-weight: 400;
  color: #94a3b8;
  margin-left: 2px;
}

.quick-action {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  border: 1px solid #e9edf5;
  border-radius: 10px;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;

  &:hover {
    border-color: #2563eb;
    color: #2563eb;
    box-shadow: 0 4px 12px -4px rgb(37 99 235 / 25%);
    transform: translateY(-1px);
  }
}

.todo-item {
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}
</style>

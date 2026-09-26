<script setup lang="ts">
import { useReportScreen } from "./utils/hook";

defineOptions({ name: "ReportScreen" });

const { data, today, metricCards, alarmColor, flowRef, zoneRef } = useReportScreen();

const alarmLevelMap: Record<string, { text: string; tag: "danger" | "warning" | "info" }> = {
  high: { text: "严重", tag: "danger" },
  medium: { text: "一般", tag: "warning" },
  low: { text: "提示", tag: "info" }
};
</script>

<template>
  <div class="p-3" style="background: #0b1226; min-height: calc(100vh - 120px)">
    <!-- 顶部标题栏 -->
    <div class="screen-header mb-3">
      <div class="screen-title">WMS 智能仓储数据大屏</div>
      <div class="screen-date">{{ today }}</div>
    </div>

    <!-- 关键指标数字卡 -->
    <el-row :gutter="12" class="mb-3">
      <el-col v-for="card in metricCards" :key="card.title" :xs="12" :sm="6">
        <el-card shadow="never" class="screen-card">
          <div class="screen-card-label">{{ card.title }}</div>
          <div class="screen-card-value" :style="{ color: card.color }">{{ card.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="12" class="mb-3">
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="screen-card">
          <template #header>
            <span class="screen-card-header">24 小时出入库流量</span>
          </template>
          <div ref="flowRef" style="height: 320px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="screen-card">
          <template #header>
            <span class="screen-card-header">库区填充率</span>
          </template>
          <div ref="zoneRef" style="height: 320px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时告警 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="never" class="screen-card">
          <template #header>
            <span class="screen-card-header">实时告警</span>
          </template>
          <div class="alarm-list">
            <el-timeline>
              <el-timeline-item
                v-for="(alarm, i) in data?.alarmList || []"
                :key="i"
                :timestamp="alarm.time"
                :color="alarmColor(alarm.level)"
              >
                <span class="alarm-text">{{ alarm.text }}</span>
                <el-tag size="small" :type="alarmLevelMap[alarm.level]?.tag || 'info'" class="ml-2">
                  {{ alarmLevelMap[alarm.level]?.text || "提示" }}
                </el-tag>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.screen-header {
  text-align: center;
  padding: 10px 0 4px;

  .screen-title {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 6px;
    color: #dcebff;
    background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.15), transparent);
    padding: 8px 0;
  }

  .screen-date {
    margin-top: 6px;
    font-size: 13px;
    color: #8ea0c0;
  }
}

.screen-card {
  background: #111a33;
  border: none;

  :deep(.el-card__header) {
    border-bottom: 1px solid rgba(140, 160, 200, 0.15);
    padding: 12px 16px;
  }
}

.screen-card-header {
  color: #dcebff;
  font-weight: 600;
}

.screen-card-label {
  color: #8ea0c0;
  font-size: 14px;
}

.screen-card-value {
  margin-top: 6px;
  font-size: 30px;
  font-weight: 700;
  font-family: "DIN Alternate", "Helvetica Neue", Arial, sans-serif;
}

.alarm-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 4px 0 2px;

  :deep(.el-timeline-item__timestamp) {
    color: #8ea0c0;
  }

  .alarm-text {
    color: #c6d4f0;
  }
}
</style>

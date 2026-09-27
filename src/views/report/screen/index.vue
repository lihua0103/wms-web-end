<script setup lang="ts">
import { useReportScreen } from "./utils/hook";
import { $t } from "@/plugins/i18n";

defineOptions({ name: "ReportScreen" });

const { data, today, metricCards, alarmColor, flowRef, zoneRef } =
  useReportScreen();

const alarmLevelMap: Record<
  string,
  { text: string; tag: "danger" | "warning" | "info" }
> = {
  high: { text: $t("report.screen.alarmHigh"), tag: "danger" },
  medium: { text: $t("report.screen.alarmMedium"), tag: "warning" },
  low: { text: $t("report.screen.alarmLow"), tag: "info" }
};
</script>

<template>
  <div class="p-3" style="min-height: calc(100vh - 120px); background: #0b1226">
    <!-- 顶部标题栏 -->
    <div class="screen-header mb-3">
      <div class="screen-title">{{ $t("report.screen.title") }}</div>
      <div class="screen-date">{{ today }}</div>
    </div>

    <!-- 关键指标数字卡 -->
    <el-row :gutter="12" class="mb-3">
      <el-col v-for="card in metricCards" :key="card.title" :xs="12" :sm="6">
        <el-card shadow="never" class="screen-card">
          <div class="screen-card-label">{{ card.title }}</div>
          <div class="screen-card-value" :style="{ color: card.color }">
            {{ card.value }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="12" class="mb-3">
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="screen-card">
          <template #header>
            <span class="screen-card-header">{{
              $t("report.screen.hourlyFlow")
            }}</span>
          </template>
          <div ref="flowRef" style="height: 320px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="screen-card">
          <template #header>
            <span class="screen-card-header">{{
              $t("report.screen.zoneFill")
            }}</span>
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
            <span class="screen-card-header">{{
              $t("report.screen.realtimeAlarm")
            }}</span>
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
                <el-tag
                  size="small"
                  :type="alarmLevelMap[alarm.level]?.tag || 'info'"
                  class="ml-2"
                >
                  {{
                    alarmLevelMap[alarm.level]?.text ||
                    $t("report.screen.alarmLow")
                  }}
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
  padding: 10px 0 4px;
  text-align: center;

  .screen-title {
    padding: 8px 0;
    font-size: 26px;
    font-weight: 700;
    color: #dcebff;
    letter-spacing: 6px;
    background: linear-gradient(
      90deg,
      transparent,
      rgb(64 158 255 / 15%),
      transparent
    );
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
    padding: 12px 16px;
    border-bottom: 1px solid rgb(140 160 200 / 15%);
  }
}

.screen-card-header {
  font-weight: 600;
  color: #dcebff;
}

.screen-card-label {
  font-size: 14px;
  color: #8ea0c0;
}

.screen-card-value {
  margin-top: 6px;
  font-family: "DIN Alternate", "Helvetica Neue", Arial, sans-serif;
  font-size: 30px;
  font-weight: 700;
}

.alarm-list {
  max-height: 300px;
  padding: 4px 4px 0 2px;
  overflow-y: auto;

  :deep(.el-timeline-item__timestamp) {
    color: #8ea0c0;
  }

  .alarm-text {
    color: #c6d4f0;
  }
}
</style>

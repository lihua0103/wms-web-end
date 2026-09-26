<script setup lang="ts">
import { useReportDashboard } from "./utils/hook";

defineOptions({ name: "ReportDashboard" });

const { statCards, categoryRef, warehouseRef, ageRef, turnoverRef } = useReportDashboard();
</script>

<template>
  <div class="p-2">
    <!-- 统计卡 -->
    <el-row :gutter="12" class="mb-3">
      <el-col v-for="card in statCards" :key="card.title" :xs="12" :sm="6">
        <el-card shadow="never">
          <div class="text-gray-500 text-sm">{{ card.title }}</div>
          <div class="text-2xl font-semibold mt-1">{{ card.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 2x2 -->
    <el-row :gutter="12" class="mb-3">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" header="类目库存分布">
          <div ref="categoryRef" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" header="各仓库库存占比">
          <div ref="warehouseRef" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="12">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" header="库龄分布">
          <div ref="ageRef" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" header="周转率 Top10">
          <div ref="turnoverRef" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

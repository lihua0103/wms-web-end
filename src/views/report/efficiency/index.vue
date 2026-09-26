<script setup lang="ts">
import { useReportEfficiency } from "./utils/hook";
import { PureTable } from "@pureadmin/table";

defineOptions({ name: "ReportEfficiency" });

const { loading, personList, columns, pieRef, barRef } = useReportEfficiency();
</script>

<template>
  <div class="p-2">
    <!-- 人员效率表格 -->
    <el-card shadow="never" header="人员效率（按任务数排序）" class="mb-3">
      <pure-table
        border
        align-whole="center"
        row-key="name"
        show-overflow-tooltip
        :data="personList"
        :columns="columns"
        :loading="loading"
        adaptive
        :adaptiveConfig="{ offsetBottom: 320 }"
      />
    </el-card>

    <!-- 图表区 -->
    <el-row :gutter="12">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" header="任务类型分布">
          <div ref="pieRef" style="height: 320px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" header="人员任务数">
          <div ref="barRef" style="height: 320px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

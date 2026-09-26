<script setup lang="ts">
import { ref } from "vue";
import { useReportInout } from "./utils/hook";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "ReportInout" });

const searchFormRef = ref();

const {
  loading,
  report,
  form,
  trendRef,
  onSearch,
  resetForm,
  summaryMethod,
  formatAmount,
  formatQty
} = useReportInout();

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="日期范围" prop="dateRange">
        <el-date-picker
          v-model="form.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px"
        />
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseCode">
        <el-select v-model="form.warehouseCode" placeholder="全部" clearable style="width: 170px">
          <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 汇总表格（无分页，带合计行） -->
    <el-card shadow="never" header="出入库汇总" class="mb-3">
      <el-table
        v-loading="loading"
        :data="report.list"
        border
        stripe
        show-summary
        :summary-method="summaryMethod"
        max-height="420"
      >
        <el-table-column label="日期" prop="date" width="160" align="center" />
        <el-table-column label="入库数量" prop="inboundQty" align="center" :formatter="formatQty" />
        <el-table-column label="出库数量" prop="outboundQty" align="center" :formatter="formatQty" />
        <el-table-column
          label="入库金额（元）"
          prop="inboundAmount"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          label="出库金额（元）"
          prop="outboundAmount"
          align="center"
          :formatter="formatAmount"
        />
      </el-table>
    </el-card>

    <!-- 出入库趋势 -->
    <el-card shadow="never" header="出入库趋势">
      <div ref="trendRef" style="height: 340px" />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>

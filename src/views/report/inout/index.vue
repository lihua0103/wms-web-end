<script setup lang="ts">
import { ref } from "vue";
import { useReportInout } from "./utils/hook";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import { $t } from "@/plugins/i18n";

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
  { value: "WH001", label: $t("report.inout.whShanghai") },
  { value: "WH002", label: $t("report.inout.whGuangzhou") },
  { value: "WH003", label: $t("report.inout.whChengdu") }
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
      <el-form-item :label="$t('report.inout.dateRange')" prop="dateRange">
        <el-date-picker
          v-model="form.dateRange"
          type="daterange"
          :range-separator="$t('report.inout.to')"
          :start-placeholder="$t('report.inout.startDate')"
          :end-placeholder="$t('report.inout.endDate')"
          value-format="YYYY-MM-DD"
          style="width: 260px"
        />
      </el-form-item>
      <el-form-item
        :label="$t('common.columns.warehouse')"
        prop="warehouseCode"
      >
        <el-select
          v-model="form.warehouseCode"
          :placeholder="$t('report.inout.all')"
          clearable
          style="width: 170px"
        >
          <el-option
            v-for="w in warehouseOptions"
            :key="w.value"
            :label="w.label"
            :value="w.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(SearchIcon)"
          @click="onSearch"
        >
          {{ $t("common.buttons.search") }}
        </el-button>
        <el-button
          :icon="useRenderIcon(RefreshIcon)"
          @click="resetForm(searchFormRef)"
        >
          {{ $t("common.buttons.reset") }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 汇总表格（无分页，带合计行） -->
    <el-card shadow="never" :header="$t('report.inout.summary')" class="mb-3">
      <el-table
        v-loading="loading"
        :data="report.list"
        border
        stripe
        show-summary
        :summary-method="summaryMethod"
        max-height="420"
      >
        <el-table-column
          :label="$t('report.inout.date')"
          prop="date"
          width="160"
          align="center"
        />
        <el-table-column
          :label="$t('report.inout.inboundQty')"
          prop="inboundQty"
          align="center"
          :formatter="formatQty"
        />
        <el-table-column
          :label="$t('report.inout.outboundQty')"
          prop="outboundQty"
          align="center"
          :formatter="formatQty"
        />
        <el-table-column
          :label="$t('report.inout.inboundAmount')"
          prop="inboundAmount"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          :label="$t('report.inout.outboundAmount')"
          prop="outboundAmount"
          align="center"
          :formatter="formatAmount"
        />
      </el-table>
    </el-card>

    <!-- 出入库趋势 -->
    <el-card shadow="never" :header="$t('report.inout.trend')">
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

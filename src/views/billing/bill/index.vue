<script setup lang="ts">
import { ref } from "vue";
import { useBillingBill } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { feeTypeOptions, billStatusOptions } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "BillingBill" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  onAction,
  handleSizeChange,
  handleCurrentChange
} = useBillingBill();

const ownerOptions = [
  { value: "货主A 华东电子", label: "货主A 华东电子" },
  { value: "货主B 精工机械", label: "货主B 精工机械" },
  { value: "货主C 日化用品", label: "货主C 日化用品" },
  { value: "自营", label: "自营" }
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
      <el-form-item label="单号" prop="code">
        <el-input
          v-model="form.code"
          placeholder="账单编号"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="货主" prop="ownerName">
        <el-select v-model="form.ownerName" placeholder="全部" clearable style="width: 170px">
          <el-option v-for="o in ownerOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="账期" prop="period">
        <el-input
          v-model="form.period"
          placeholder="如 2026-08"
          clearable
          style="width: 130px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="费用类型" prop="feeType">
        <el-select v-model="form.feeType" placeholder="全部" clearable style="width: 130px">
          <el-option v-for="d in feeTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="d in billStatusOptions" :key="d.value" :label="d.label" :value="d.value" />
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

    <PureTableBar title="费用账单" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          align-whole="center"
          row-key="id"
          show-overflow-tooltip
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 120 }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button v-if="row.status === 'pending'" link type="primary" @click="onAction(row, 'confirm')">
              确认
            </el-button>
            <el-button
              v-else-if="row.status === 'confirmed'"
              link
              type="warning"
              @click="onAction(row, 'invoice')"
            >
              开票
            </el-button>
            <el-button
              v-else-if="row.status === 'invoiced'"
              link
              type="success"
              @click="onAction(row, 'settle')"
            >
              结算
            </el-button>
            <span v-else class="text-gray-400">-</span>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>

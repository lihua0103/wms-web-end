<script setup lang="ts">
import { ref } from "vue";
import { useBillingReconcile } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "BillingReconcile" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  reconcileStatusOptions,
  onSearch,
  resetForm,
  onAction,
  handleSizeChange,
  handleCurrentChange
} = useBillingReconcile();

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
          placeholder="对账单号"
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
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="全部" clearable style="width: 120px">
          <el-option
            v-for="d in reconcileStatusOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
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

    <PureTableBar title="对账单" :columns="columns" @refresh="onSearch">
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
            <template v-if="row.status === 'pending'">
              <el-button link type="primary" @click="onAction(row, 'confirm')">
                确认对账
              </el-button>
              <el-button link type="danger" @click="onAction(row, 'dispute')">
                提出异议
              </el-button>
            </template>
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

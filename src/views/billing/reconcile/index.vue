<script setup lang="ts">
import { ref } from "vue";
import { useBillingReconcile } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { $t } from "@/plugins/i18n";
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
  handleSizeChange,
  handleCurrentChange
} = useBillingReconcile();

// value 为 mock 数据匹配值，保持原文；label 为展示文案
const ownerOptions = [
  { value: "货主A 华东电子", label: $t("billing.reconcile.ownerA") },
  { value: "货主B 精工机械", label: $t("billing.reconcile.ownerB") },
  { value: "货主C 日化用品", label: $t("billing.reconcile.ownerC") },
  { value: "自营", label: $t("billing.reconcile.selfOwned") }
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
      <el-form-item :label="$t('billing.reconcile.noLabel')" prop="code">
        <el-input
          v-model="form.code"
          :placeholder="$t('billing.reconcile.no')"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.owner')" prop="ownerName">
        <el-select
          v-model="form.ownerName"
          :placeholder="$t('billing.reconcile.all')"
          clearable
          style="width: 170px"
        >
          <el-option
            v-for="o in ownerOptions"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('billing.reconcile.period')" prop="period">
        <el-input
          v-model="form.period"
          :placeholder="$t('billing.reconcile.periodPh')"
          clearable
          style="width: 130px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('billing.reconcile.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in reconcileStatusOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
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

    <PureTableBar
      :title="$t('billing.reconcile.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          row-key="id"
          show-overflow-tooltip
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 140 }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        />
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

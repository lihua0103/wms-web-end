<script setup lang="ts">
import { ref } from "vue";
import { useBillingRule } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { feeTypeOptions, userStatusOptions } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import AddFill from "~icons/ep/plus";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "BillingRule" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  openDialog,
  handleSizeChange,
  handleCurrentChange
} = useBillingRule();

// value 为 mock 数据匹配值，保持原文；label 为展示文案
const ownerOptions = [
  { value: "货主A 华东电子", label: $t("billing.rule.ownerA") },
  { value: "货主B 精工机械", label: $t("billing.rule.ownerB") },
  { value: "货主C 日化用品", label: $t("billing.rule.ownerC") },
  { value: "自营", label: $t("billing.rule.selfOwned") }
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
      <el-form-item :label="$t('common.columns.code')" prop="code">
        <el-input
          v-model="form.code"
          :placeholder="$t('billing.rule.code')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.owner')" prop="ownerName">
        <el-select
          v-model="form.ownerName"
          :placeholder="$t('billing.rule.all')"
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
      <el-form-item :label="$t('billing.rule.feeType')" prop="feeType">
        <el-select
          v-model="form.feeType"
          :placeholder="$t('billing.rule.all')"
          clearable
          style="width: 130px"
        >
          <el-option
            v-for="d in feeTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('billing.rule.all')"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="d in userStatusOptions"
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
      :title="$t('billing.rule.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('billing.rule.addTitle'))"
        >
          {{ $t("billing.rule.addBtn") }}
        </el-button>
      </template>
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

<script setup lang="ts">
import { ref } from "vue";
import { useProcess } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { $t } from "@/plugins/i18n";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import AddFill from "~icons/ep/plus";

defineOptions({ name: "OperationProcess" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  statusMap,
  onSearch,
  resetForm,
  openDialog,
  handleSizeChange,
  handleCurrentChange
} = useProcess();

const processTypeOptions = [
  { value: "贴标", label: $t("operation.process.typeLabeling") },
  { value: "组套", label: $t("operation.process.typeKitting") },
  { value: "分装", label: $t("operation.process.typeRepacking") }
];

const statusOptions = [
  { value: "pending", label: $t("operation.process.statusDraft") },
  { value: "processing", label: $t("operation.process.statusProcessing") },
  { value: "finished", label: $t("operation.process.statusFinished") },
  { value: "cancelled", label: $t("operation.process.statusCancelled") }
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
      <el-form-item :label="$t('operation.process.orderNo')" prop="code">
        <el-input
          v-model="form.code"
          :placeholder="$t('operation.process.code')"
          clearable
          style="width: 160px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.type')" prop="processType">
        <el-select
          v-model="form.processType"
          :placeholder="$t('operation.process.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="t in processTypeOptions"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('operation.process.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="s in statusOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(SearchIcon)"
          @click="onSearch"
          >{{ $t("common.buttons.search") }}</el-button
        >
        <el-button
          :icon="useRenderIcon(RefreshIcon)"
          @click="resetForm(searchFormRef)"
          >{{ $t("common.buttons.reset") }}</el-button
        >
      </el-form-item>
    </el-form>

    <PureTableBar
      :title="$t('operation.process.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('operation.process.createOrder'))"
        >
          {{ $t("operation.process.createOrder") }}
        </el-button>
      </template>
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

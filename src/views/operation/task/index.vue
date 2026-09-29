<script setup lang="ts">
import { ref } from "vue";
import { useTask } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { taskTypeOptions, taskStatusOptions } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "OperationTask" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleSizeChange,
  handleCurrentChange
} = useTask();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="$t('operation.task.taskNo')" prop="taskNo">
        <el-input
          v-model="form.taskNo"
          :placeholder="$t('operation.task.taskNo')"
          clearable
          style="width: 160px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.type')" prop="taskType">
        <el-select
          v-model="form.taskType"
          :placeholder="$t('operation.task.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in taskTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('operation.task.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in taskStatusOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="keyword">
        <el-input
          v-model="form.keyword"
          :placeholder="$t('operation.task.keywordPh')"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
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
      :title="$t('operation.task.title')"
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

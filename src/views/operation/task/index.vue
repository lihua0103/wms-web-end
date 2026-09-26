<script setup lang="ts">
import { ref } from "vue";
import { useTask } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { taskTypeOptions, taskStatusOptions } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import User from "~icons/ep/user";
import CircleClose from "~icons/ep/circle-close";

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
  openAssignDialog,
  handleCancel,
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
      <el-form-item label="任务号" prop="taskNo">
        <el-input v-model="form.taskNo" placeholder="任务号" clearable style="width: 160px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="类型" prop="taskType">
        <el-select v-model="form.taskType" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="d in taskTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="d in taskStatusOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item prop="keyword">
        <el-input v-model="form.keyword" placeholder="单据/物料关键词" clearable style="width: 180px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">搜索</el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="任务池" :columns="columns" @refresh="onSearch">
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
            <el-button
              v-if="['pending', 'processing', 'error'].includes(row.status)"
              link
              type="primary"
              :icon="useRenderIcon(User)"
              @click="openAssignDialog(row)"
            >
              分配
            </el-button>
            <el-button
              v-if="['pending', 'error'].includes(row.status)"
              link
              type="danger"
              :icon="useRenderIcon(CircleClose)"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
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

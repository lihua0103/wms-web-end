<script setup lang="ts">
import { ref } from "vue";
import { useAgvTask, agvTaskTypeOptions } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceTaskStatusOptions } from "@/constants/wms";
import AddFill from "~icons/ep/promotion";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import RefreshRight from "~icons/ep/refresh-right";

defineOptions({ name: "IntegrationAgv" });

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
  handleRetry,
  handleSizeChange,
  handleCurrentChange
} = useAgvTask();
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
        <el-input
          v-model="form.taskNo"
          placeholder="AGV 任务号"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="AGV" prop="agvCode">
        <el-input
          v-model="form.agvCode"
          placeholder="AGV 编号"
          clearable
          style="width: 130px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="类型" prop="taskType">
        <el-select
          v-model="form.taskType"
          placeholder="全部"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="t in agvTaskTypeOptions"
            :key="t.value"
            :label="t.label"
            :value="t.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in deviceTaskStatusOptions"
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
          >搜索</el-button
        >
        <el-button
          :icon="useRenderIcon(RefreshIcon)"
          @click="resetForm(searchFormRef)"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <PureTableBar title="AGV 调度" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog"
        >
          下发任务
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
        >
          <template #operation="{ row }">
            <el-button
              v-if="row.status === 'failed'"
              link
              type="warning"
              :icon="useRenderIcon(RefreshRight)"
              @click="handleRetry(row)"
            >
              重新下发
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

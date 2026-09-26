<script setup lang="ts">
import { ref } from "vue";
import { useDeviceTask } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deviceTypeOptions, deviceTaskStatusOptions } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import CircleClose from "~icons/ep/circle-close";

defineOptions({ name: "IntegrationDeviceTask" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleCancel,
  handleSizeChange,
  handleCurrentChange
} = useDeviceTask();
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
          placeholder="设备任务号"
          clearable
          style="width: 170px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="设备" prop="deviceCode">
        <el-input
          v-model="form.deviceCode"
          placeholder="设备编码"
          clearable
          style="width: 130px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="业务单号" prop="bizNo">
        <el-input
          v-model="form.bizNo"
          placeholder="关联业务单号"
          clearable
          style="width: 160px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="类型" prop="deviceType">
        <el-select
          v-model="form.deviceType"
          placeholder="全部"
          clearable
          style="width: 130px"
        >
          <el-option
            v-for="d in deviceTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
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

    <PureTableBar title="设备任务" :columns="columns" @refresh="onSearch">
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
              v-if="['queued', 'executing'].includes(row.status)"
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

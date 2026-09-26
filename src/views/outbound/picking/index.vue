<script setup lang="ts">
import { ref } from "vue";
import { usePicking } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { taskStatusOptions } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import VideoPlay from "~icons/ep/video-play";
import CircleCheck from "~icons/ep/circle-check";

defineOptions({ name: "OutboundPicking" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleStart,
  handleFinish,
  handleSizeChange,
  handleCurrentChange
} = usePicking();

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
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
      <el-form-item label="任务号" prop="taskNo">
        <el-input v-model="form.taskNo" placeholder="任务号" clearable style="width: 150px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseCode">
        <el-select v-model="form.warehouseCode" placeholder="全部" clearable style="width: 150px">
          <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="d in taskStatusOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">搜索</el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="拣货任务" :columns="columns" @refresh="onSearch">
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
              v-if="row.status === 'pending'"
              link
              type="primary"
              :icon="useRenderIcon(VideoPlay)"
              @click="handleStart(row)"
            >
              开始
            </el-button>
            <el-button
              v-if="row.status === 'processing'"
              link
              type="success"
              :icon="useRenderIcon(CircleCheck)"
              @click="handleFinish(row)"
            >
              完成
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

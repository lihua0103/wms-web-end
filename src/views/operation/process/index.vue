<script setup lang="ts">
import { ref } from "vue";
import { useProcess } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import AddFill from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import VideoPlay from "~icons/ep/video-play";
import CircleCheck from "~icons/ep/circle-check";

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
  handleStart,
  handleFinish,
  handleDelete,
  handleSizeChange,
  handleCurrentChange
} = useProcess();

const processTypeOptions = [
  { value: "贴标", label: "贴标" },
  { value: "组套", label: "组套" },
  { value: "分装", label: "分装" }
];

const statusOptions = [
  { value: "pending", label: "草稿" },
  { value: "processing", label: "加工中" },
  { value: "finished", label: "已完成" },
  { value: "cancelled", label: "已取消" }
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
        <el-input v-model="form.code" placeholder="加工单号" clearable style="width: 160px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="类型" prop="processType">
        <el-select v-model="form.processType" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="t in processTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">搜索</el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="加工管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog('创建加工单')">
          创建加工单
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
              v-if="row.status === 'pending'"
              link
              type="primary"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('编辑加工单', row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="warning"
              :icon="useRenderIcon(VideoPlay)"
              @click="handleStart(row)"
            >
              开工
            </el-button>
            <el-button
              v-if="row.status === 'processing'"
              link
              type="success"
              :icon="useRenderIcon(CircleCheck)"
              @click="handleFinish(row)"
            >
              完工
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="danger"
              :icon="useRenderIcon(Delete)"
              @click="handleDelete(row)"
            >
              删除
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

<script setup lang="ts">
import { ref } from "vue";
import { useAsn } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { inboundTypeOptions } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import AddFill from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import CircleCheck from "~icons/ep/circle-check";
import CircleClose from "~icons/ep/circle-close";

defineOptions({ name: "InboundAsn" });

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
  handleApprove,
  handleDelete,
  handleSizeChange,
  handleCurrentChange
} = useAsn();

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];

const statusOptions = [
  { value: "draft", label: "草稿" },
  { value: "pending", label: "待审核" },
  { value: "approved", label: "已审核" },
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
        <el-input v-model="form.code" placeholder="预约单号" clearable style="width: 160px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseCode">
        <el-select v-model="form.warehouseCode" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" placeholder="全部" clearable style="width: 130px">
          <el-option v-for="d in inboundTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
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

    <PureTableBar title="入库预约" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog('新增预约单')">
          新增预约单
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
              v-if="['draft', 'pending'].includes(row.status)"
              link
              type="primary"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('编辑预约单', row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="success"
              :icon="useRenderIcon(CircleCheck)"
              @click="handleApprove(row, true)"
            >
              审核
            </el-button>
            <el-button
              v-if="['draft', 'pending'].includes(row.status)"
              link
              type="warning"
              :icon="useRenderIcon(CircleClose)"
              @click="handleApprove(row, false)"
            >
              取消
            </el-button>
            <el-button
              v-if="row.status === 'draft'"
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

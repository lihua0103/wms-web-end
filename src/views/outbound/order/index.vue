<script setup lang="ts">
import { ref } from "vue";
import { useOutboundOrder } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  outboundTypeOptions,
  outboundStatusOptions,
  priorityOptions
} from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import AddFill from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import View from "~icons/ep/view";
import CircleCheck from "~icons/ep/circle-check";
import CircleClose from "~icons/ep/circle-close";

defineOptions({ name: "OutboundOrder" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  detailVisible,
  currentRow,
  onSearch,
  resetForm,
  openDetail,
  openDialog,
  handleApprove,
  handleDelete,
  handleSizeChange,
  handleCurrentChange
} = useOutboundOrder();

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
      <el-form-item label="单号" prop="code">
        <el-input v-model="form.code" placeholder="出库单号" clearable style="width: 150px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseCode">
        <el-select v-model="form.warehouseCode" placeholder="全部" clearable style="width: 150px">
          <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="form.type" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="d in outboundTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="form.priority" placeholder="全部" clearable style="width: 110px">
          <el-option v-for="d in priorityOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="d in outboundStatusOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">搜索</el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="出库单" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog('新增出库单')">
          新增出库单
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
            <el-button link type="primary" :icon="useRenderIcon(View)" @click="openDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="['pending'].includes(row.status)"
              link
              type="primary"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('编辑出库单', row)"
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
              v-if="row.status === 'pending'"
              link
              type="warning"
              :icon="useRenderIcon(CircleClose)"
              @click="handleApprove(row, false)"
            >
              取消
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

    <!-- 出库单详情 -->
    <el-drawer v-model="detailVisible" title="出库单详情" size="420px">
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="出库单号">{{ currentRow.code }}</el-descriptions-item>
        <el-descriptions-item label="仓库">{{ currentRow.warehouseCode }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ currentRow.customerName }}</el-descriptions-item>
        <el-descriptions-item label="货主">{{ currentRow.ownerName }}</el-descriptions-item>
        <el-descriptions-item label="物料编码">{{ currentRow.materialCode }}</el-descriptions-item>
        <el-descriptions-item label="物料名称">{{ currentRow.materialName }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ currentRow.qty }}</el-descriptions-item>
        <el-descriptions-item label="优先级">{{ currentRow.priority }}</el-descriptions-item>
        <el-descriptions-item label="交货日期">{{ currentRow.deliveryDate || "-" }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentRow.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>

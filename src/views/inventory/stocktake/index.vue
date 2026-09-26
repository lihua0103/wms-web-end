<script setup lang="ts">
import { ref } from "vue";
import { useStocktake } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { stocktakeStatusOptions, dictTag, dictLabel } from "@/constants/wms";
import AddFill from "~icons/ep/plus";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import View from "~icons/ep/view";

defineOptions({ name: "InventoryStocktake" });

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
  onAction,
  detailVisible,
  currentStocktake,
  detailLoading,
  detailList,
  detailPagination,
  detailColumns,
  openDetail,
  fetchDetail,
  saveActual,
  handleSizeChange,
  handleCurrentChange
} = useStocktake();

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
        <el-input v-model="form.code" placeholder="盘点单号" clearable style="width: 180px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="仓库" prop="warehouseCode">
        <el-select v-model="form.warehouseCode" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="全部" clearable style="width: 140px">
          <el-option v-for="d in stocktakeStatusOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">搜索</el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="盘点管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog">
          创建盘点单
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
          <template #status="{ row }">
            <el-tag :type="dictTag(stocktakeStatusOptions, row.status)">
              {{ dictLabel(stocktakeStatusOptions, row.status) }}
            </el-tag>
          </template>
          <template #operation="{ row }">
            <el-button link type="primary" :icon="useRenderIcon(View)" @click="openDetail(row)">
              明细
            </el-button>
            <el-button v-if="row.status === 'draft'" link type="primary" @click="onAction(row, 'start')">
              开始盘点
            </el-button>
            <el-button v-if="row.status === 'counting'" link type="warning" @click="onAction(row, 'submit')">
              提交差异
            </el-button>
            <el-button v-if="row.status === 'diff'" link type="success" @click="onAction(row, 'finish')">
              完成
            </el-button>
            <el-button
              v-if="['draft', 'counting', 'diff'].includes(row.status)"
              link
              type="danger"
              @click="onAction(row, 'cancel')"
            >
              取消
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 盘点明细 -->
    <el-dialog
      v-model="detailVisible"
      :title="`盘点明细 - ${currentStocktake?.code || ''}`"
      width="960px"
      destroy-on-close
    >
      <pure-table
        border
        align-whole="center"
        row-key="id"
        show-overflow-tooltip
        :data="detailList"
        :columns="detailColumns"
        :pagination="detailPagination"
        :loading="detailLoading"
        size="small"
        height="420px"
        @page-size-change="
          (v: number) => {
            detailPagination.pageSize = v;
            fetchDetail();
          }
        "
        @page-current-change="
          (v: number) => {
            detailPagination.currentPage = v;
            fetchDetail();
          }
        "
      >
        <template #actual="{ row }">
          <el-input-number
            v-model="row.actualQty"
            :min="0"
            size="small"
            controls-position="right"
            style="width: 120px"
          />
        </template>
        <template #dop="{ row }">
          <el-button link type="primary" @click="saveActual(row)">保存</el-button>
        </template>
      </pure-table>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>

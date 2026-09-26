<script setup lang="ts">
import { ref } from "vue";
import { useMaterial } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { materialCategoryOptions } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import AddFill from "~icons/ep/plus";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import View from "~icons/ep/view";

defineOptions({ name: "MasterMaterial" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  detailVisible,
  currentRow,
  materialCategoryOptions,
  onSearch,
  resetForm,
  openDetail,
  openDialog,
  handleDelete,
  handleSizeChange,
  handleCurrentChange
} = useMaterial();

const serialOptions = [
  { value: 1, label: "是" },
  { value: 0, label: "否" }
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
      <el-form-item label="编码" prop="code">
        <el-input v-model="form.code" placeholder="物料编码" clearable style="width: 140px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="物料名称" clearable style="width: 150px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="全部" clearable style="width: 130px">
          <el-option v-for="d in materialCategoryOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="序列号" prop="isSerial">
        <el-select v-model="form.isSerial" placeholder="全部" clearable style="width: 100px">
          <el-option v-for="s in serialOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">搜索</el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="物料管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog('新增物料')">
          新增物料
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
              link
              type="primary"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('编辑物料', row)"
            >
              编辑
            </el-button>
            <el-button
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

    <!-- 物料详情 -->
    <el-drawer v-model="detailVisible" title="物料详情" size="420px">
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="物料编码">{{ currentRow.code }}</el-descriptions-item>
        <el-descriptions-item label="物料名称">{{ currentRow.name }}</el-descriptions-item>
        <el-descriptions-item label="规格">{{ currentRow.spec || "-" }}</el-descriptions-item>
        <el-descriptions-item label="单位">{{ currentRow.unit || "-" }}</el-descriptions-item>
        <el-descriptions-item label="条码">{{ currentRow.barcode || "-" }}</el-descriptions-item>
        <el-descriptions-item label="货主">{{ currentRow.ownerName || "-" }}</el-descriptions-item>
        <el-descriptions-item label="安全库存">{{ currentRow.safetyQty }}</el-descriptions-item>
        <el-descriptions-item label="单价">{{ currentRow.price }} 元</el-descriptions-item>
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

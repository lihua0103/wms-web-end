<script setup lang="ts">
import { ref } from "vue";
import { useQc } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import EditPen from "~icons/ep/edit-pen";

defineOptions({ name: "InboundQc" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  qcResultOptions,
  onSearch,
  resetForm,
  openSubmitDialog,
  handleSizeChange,
  handleCurrentChange
} = useQc();
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
        <el-input v-model="form.code" placeholder="质检单号" clearable style="width: 150px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="收货单" prop="receiptCode">
        <el-input v-model="form.receiptCode" placeholder="收货单号" clearable style="width: 150px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="物料" prop="materialCode">
        <el-input v-model="form.materialCode" placeholder="物料编码" clearable style="width: 130px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="结果" prop="qcResult">
        <el-select v-model="form.qcResult" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="d in qcResultOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">搜索</el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="质检管理" :columns="columns" @refresh="onSearch">
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
              link
              type="primary"
              :icon="useRenderIcon(EditPen)"
              @click="openSubmitDialog(row)"
            >
              {{ row.qcResult === "waiting" ? "录入结果" : "修改结果" }}
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

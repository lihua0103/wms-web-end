<script setup lang="ts">
import { ref } from "vue";
import { useShipping } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import Van from "~icons/ep/van";

defineOptions({ name: "OutboundShipping" });

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
  handleConfirm,
  handleSizeChange,
  handleCurrentChange
} = useShipping();

const carrierOptions = ["顺丰速运", "京东物流", "德邦快递", "自有车队"];

const statusOptions = [
  { value: "waiting", label: "待发货" },
  { value: "shipped", label: "已发货" },
  { value: "finished", label: "已完成" }
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
        <el-input v-model="form.code" placeholder="交接单号" clearable style="width: 150px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="承运商" prop="carrierName">
        <el-select v-model="form.carrierName" placeholder="全部" clearable style="width: 140px">
          <el-option v-for="c in carrierOptions" :key="c" :label="c" :value="c" />
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

    <PureTableBar title="发货交接" :columns="columns" @refresh="onSearch">
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
              v-if="row.status === 'waiting'"
              link
              type="primary"
              :icon="useRenderIcon(Van)"
              @click="handleConfirm(row)"
            >
              发货确认
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

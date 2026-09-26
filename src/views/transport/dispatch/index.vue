<script setup lang="ts">
import { ref } from "vue";
import { useDispatch } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deliveryStatusOptions } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import Van from "~icons/ep/van";
import CircleCheck from "~icons/ep/circle-check";

defineOptions({ name: "TransportDispatch" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  openAssignDialog,
  handleSign,
  handleSizeChange,
  handleCurrentChange
} = useDispatch();
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
        <el-input v-model="form.code" placeholder="配送单号" clearable style="width: 160px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="客户" prop="customerName">
        <el-input v-model="form.customerName" placeholder="客户名称" clearable style="width: 160px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="全部" clearable style="width: 130px">
          <el-option v-for="d in deliveryStatusOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">搜索</el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="配送单" :columns="columns" @refresh="onSearch">
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
              v-if="['pending'].includes(row.status)"
              link
              type="primary"
              :icon="useRenderIcon(Van)"
              @click="openAssignDialog(row)"
            >
              调度
            </el-button>
            <el-button
              v-if="['dispatched', 'delivering'].includes(row.status)"
              link
              type="success"
              :icon="useRenderIcon(CircleCheck)"
              @click="handleSign(row)"
            >
              签收
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

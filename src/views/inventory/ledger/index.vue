<script setup lang="ts">
import { ref } from "vue";
import { useLedger } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { stockStatusOptions } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import Lock from "~icons/ep/lock";
import Unlock from "~icons/ep/unlock";

defineOptions({ name: "InventoryLedger" });

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
  handleFreeze,
  handleSizeChange,
  handleCurrentChange
} = useLedger();

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
      <el-form-item label="仓库" prop="warehouseCode">
        <el-select v-model="form.warehouseCode" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="库位" prop="locationCode">
        <el-input v-model="form.locationCode" placeholder="库位" clearable style="width: 120px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="物料" prop="materialCode">
        <el-input v-model="form.materialCode" placeholder="物料编码" clearable style="width: 130px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item prop="materialName">
        <el-input v-model="form.materialName" placeholder="物料名称" clearable style="width: 150px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="批次" prop="batchNo">
        <el-input v-model="form.batchNo" placeholder="批次号" clearable style="width: 120px" @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="状态" prop="stockStatus">
        <el-select v-model="form.stockStatus" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="d in stockStatusOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(SearchIcon)" @click="onSearch">搜索</el-button>
        <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(searchFormRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="库存台账" :columns="columns" @refresh="onSearch">
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
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button
              v-if="row.stockStatus !== 'frozen'"
              link
              type="warning"
              :icon="useRenderIcon(Lock)"
              @click="handleFreeze(row, true)"
            >
              冻结
            </el-button>
            <el-button
              v-else
              link
              type="success"
              :icon="useRenderIcon(Unlock)"
              @click="handleFreeze(row, false)"
            >
              解冻
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 库存详情 -->
    <el-drawer v-model="detailVisible" title="库存详情" size="420px">
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="仓库">{{ currentRow.warehouseName }}</el-descriptions-item>
        <el-descriptions-item label="库位">{{ currentRow.locationCode }}</el-descriptions-item>
        <el-descriptions-item label="物料编码">{{ currentRow.materialCode }}</el-descriptions-item>
        <el-descriptions-item label="物料名称">{{ currentRow.materialName }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ currentRow.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="库存量">{{ currentRow.qty }}</el-descriptions-item>
        <el-descriptions-item label="锁定数量">{{ currentRow.lockedQty }}</el-descriptions-item>
        <el-descriptions-item label="可用数量">{{ currentRow.availableQty }}</el-descriptions-item>
        <el-descriptions-item label="货主">{{ currentRow.ownerName }}</el-descriptions-item>
        <el-descriptions-item label="失效日期">{{ currentRow.expiredAt || "-" }}</el-descriptions-item>
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

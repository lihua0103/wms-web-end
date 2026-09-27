<script setup lang="ts">
import { ref } from "vue";
import { useLedger } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { stockStatusOptions } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

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
  handleSizeChange,
  handleCurrentChange
} = useLedger();

const warehouseOptions = [
  { value: "WH001", label: $t("inventory.ledger.whShanghai") },
  { value: "WH002", label: $t("inventory.ledger.whGuangzhou") },
  { value: "WH003", label: $t("inventory.ledger.whChengdu") }
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
      <el-form-item
        :label="$t('common.columns.warehouse')"
        prop="warehouseCode"
      >
        <el-select
          v-model="form.warehouseCode"
          :placeholder="$t('inventory.ledger.all')"
          clearable
          style="width: 160px"
        >
          <el-option
            v-for="w in warehouseOptions"
            :key="w.value"
            :label="w.label"
            :value="w.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.location')" prop="locationCode">
        <el-input
          v-model="form.locationCode"
          :placeholder="$t('common.columns.location')"
          clearable
          style="width: 120px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.material')" prop="materialCode">
        <el-input
          v-model="form.materialCode"
          :placeholder="$t('inventory.ledger.materialCode')"
          clearable
          style="width: 130px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item prop="materialName">
        <el-input
          v-model="form.materialName"
          :placeholder="$t('inventory.ledger.materialName')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('inventory.ledger.batch')" prop="batchNo">
        <el-input
          v-model="form.batchNo"
          :placeholder="$t('common.columns.batchNo')"
          clearable
          style="width: 120px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="stockStatus">
        <el-select
          v-model="form.stockStatus"
          :placeholder="$t('inventory.ledger.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in stockStatusOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(SearchIcon)"
          @click="onSearch"
          >{{ $t("common.buttons.search") }}</el-button
        >
        <el-button
          :icon="useRenderIcon(RefreshIcon)"
          @click="resetForm(searchFormRef)"
          >{{ $t("common.buttons.reset") }}</el-button
        >
      </el-form-item>
    </el-form>

    <PureTableBar
      :title="$t('inventory.ledger.title')"
      :columns="columns"
      @refresh="onSearch"
    >
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
        />
      </template>
    </PureTableBar>

    <!-- 库存详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('inventory.ledger.detailTitle')"
      size="420px"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item :label="$t('common.columns.warehouse')">{{
          currentRow.warehouseName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.location')">{{
          currentRow.locationCode
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.ledger.materialCode')">{{
          currentRow.materialCode
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.ledger.materialName')">{{
          currentRow.materialName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.batchNo')">{{
          currentRow.batchNo
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.ledger.qty')">{{
          currentRow.qty
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.ledger.lockedQty')">{{
          currentRow.lockedQty
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.ledger.availableQty')">{{
          currentRow.availableQty
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.owner')">{{
          currentRow.ownerName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.ledger.expiredAt')">{{
          currentRow.expiredAt || "-"
        }}</el-descriptions-item>
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

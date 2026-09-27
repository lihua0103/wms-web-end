<script setup lang="ts">
import { ref } from "vue";
import { useStocktake } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { stocktakeStatusOptions, dictTag, dictLabel } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import AddFill from "~icons/ep/plus";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

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
  detailVisible,
  currentStocktake,
  detailLoading,
  detailList,
  detailPagination,
  detailColumns,
  fetchDetail,
  saveActual,
  handleSizeChange,
  handleCurrentChange
} = useStocktake();

const warehouseOptions = [
  { value: "WH001", label: $t("inventory.stocktake.whShanghai") },
  { value: "WH002", label: $t("inventory.stocktake.whGuangzhou") },
  { value: "WH003", label: $t("inventory.stocktake.whChengdu") }
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
      <el-form-item :label="$t('inventory.stocktake.docNo')" prop="code">
        <el-input
          v-model="form.code"
          :placeholder="$t('inventory.stocktake.stocktakeNo')"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('common.columns.warehouse')"
        prop="warehouseCode"
      >
        <el-select
          v-model="form.warehouseCode"
          :placeholder="$t('inventory.stocktake.all')"
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
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('inventory.stocktake.all')"
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="d in stocktakeStatusOptions"
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
      :title="$t('inventory.stocktake.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog"
        >
          {{ $t("inventory.stocktake.create") }}
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
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 盘点明细 -->
    <el-dialog
      v-model="detailVisible"
      :title="
        $t('inventory.stocktake.detailTitle', {
          code: currentStocktake?.code || ''
        })
      "
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
          <el-button link type="primary" @click="saveActual(row)">{{
            $t("common.buttons.save")
          }}</el-button>
        </template>
      </pure-table>
      <template #footer>
        <el-button @click="detailVisible = false">{{
          $t("common.buttons.close")
        }}</el-button>
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

<script setup lang="ts">
import { ref } from "vue";
import { useSerial } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { serialStatusOptions } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import AddFill from "~icons/ep/plus";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "InventorySerial" });

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
  openDialog,
  handleSizeChange,
  handleCurrentChange
} = useSerial();

const warehouseOptions = [
  { value: "WH001", label: $t("inventory.serial.whShanghai") },
  { value: "WH002", label: $t("inventory.serial.whGuangzhou") },
  { value: "WH003", label: $t("inventory.serial.whChengdu") }
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
      <el-form-item :label="$t('inventory.serial.serialNo')" prop="serialNo">
        <el-input
          v-model="form.serialNo"
          :placeholder="$t('inventory.serial.serialNo')"
          clearable
          style="width: 170px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('inventory.serial.materialCode')"
        prop="materialCode"
      >
        <el-input
          v-model="form.materialCode"
          :placeholder="$t('inventory.serial.materialCode')"
          clearable
          style="width: 130px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('inventory.serial.materialName')"
        prop="materialName"
      >
        <el-input
          v-model="form.materialName"
          :placeholder="$t('inventory.serial.materialName')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('common.columns.warehouse')"
        prop="warehouseCode"
      >
        <el-select
          v-model="form.warehouseCode"
          :placeholder="$t('inventory.serial.all')"
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
          :placeholder="$t('inventory.serial.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in serialStatusOptions"
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
      :title="$t('inventory.serial.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('inventory.serial.addTitle'))"
        >
          {{ $t("common.buttons.add") }}
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          row-key="id"
          show-overflow-tooltip
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 140 }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        />
      </template>
    </PureTableBar>

    <!-- 序列号详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('inventory.serial.detailTitle')"
      size="420px"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item :label="$t('inventory.serial.serialNo')">{{
          currentRow.serialNo
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.serial.materialCode')">{{
          currentRow.materialCode
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.serial.materialName')">{{
          currentRow.materialName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.serial.batch')">{{
          currentRow.batchNo || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.status')">{{
          currentRow.status
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.warehouse')">{{
          currentRow.warehouseCode
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.location')">{{
          currentRow.locationCode || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.serial.inboundDate')">{{
          currentRow.inboundDate || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.serial.outboundDate')">{{
          currentRow.outboundDate || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('inventory.serial.orderNo')">{{
          currentRow.orderNo || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.remark')">{{
          currentRow.remark || "-"
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

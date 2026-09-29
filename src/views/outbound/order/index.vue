<script setup lang="ts">
import { ref } from "vue";
import { $t } from "@/plugins/i18n";
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
  { value: "WH001", label: $t("outbound.order.whShanghai") },
  { value: "WH002", label: $t("outbound.order.whGuangzhou") },
  { value: "WH003", label: $t("outbound.order.whChengdu") }
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
      <el-form-item :label="$t('outbound.order.no')" prop="code">
        <el-input
          v-model="form.code"
          :placeholder="$t('outbound.order.orderNo')"
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
          :placeholder="$t('outbound.order.all')"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="w in warehouseOptions"
            :key="w.value"
            :label="w.label"
            :value="w.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.type')" prop="type">
        <el-select
          v-model="form.type"
          :placeholder="$t('outbound.order.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in outboundTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('outbound.order.priority')" prop="priority">
        <el-select
          v-model="form.priority"
          :placeholder="$t('outbound.order.all')"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="d in priorityOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('outbound.order.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in outboundStatusOptions"
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
      :title="$t('outbound.order.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('outbound.order.addOrder'))"
        >
          {{ $t("outbound.order.addOrder") }}
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

    <!-- 出库单详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('outbound.order.detailTitle')"
      size="420px"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item :label="$t('outbound.order.orderNo')">{{
          currentRow.code
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.warehouse')">{{
          currentRow.warehouseCode
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('outbound.order.customer')">{{
          currentRow.customerName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.owner')">{{
          currentRow.ownerName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('outbound.order.materialCode')">{{
          currentRow.materialCode
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('outbound.order.materialName')">{{
          currentRow.materialName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.quantity')">{{
          currentRow.qty
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('outbound.order.priority')">{{
          currentRow.priority
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('outbound.order.deliveryDate')">{{
          currentRow.deliveryDate || "-"
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

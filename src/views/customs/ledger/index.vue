<script setup lang="ts">
import { ref } from "vue";
import { useCustomsLedger } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  customsLedgerTypeOptions,
  customsLedgerStatusOptions,
  supervisionModeOptions
} from "@/constants/wms";
import AddFill from "~icons/ep/plus";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "CustomsLedger" });

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
} = useCustomsLedger();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="$t('customs.ledger.ledgerNo')" prop="ledgerNo">
        <el-input
          v-model="form.ledgerNo"
          :placeholder="$t('customs.ledger.ledgerNo')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('customs.ledger.enterpriseName')"
        prop="enterpriseName"
      >
        <el-input
          v-model="form.enterpriseName"
          :placeholder="$t('customs.ledger.enterpriseNamePh')"
          clearable
          style="width: 160px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('customs.ledger.ledgerType')" prop="ledgerType">
        <el-select
          v-model="form.ledgerType"
          :placeholder="$t('customs.ledger.all')"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="d in customsLedgerTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('customs.ledger.all')"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="d in customsLedgerStatusOptions"
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
      :title="$t('customs.ledger.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('customs.ledger.addTitle'))"
        >
          {{ $t("customs.ledger.add") }}
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
        />
      </template>
    </PureTableBar>

    <!-- 账册底账明细 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('customs.ledger.detailTitle')"
      size="720px"
    >
      <el-descriptions v-if="currentRow" :column="2" border class="mb-4">
        <el-descriptions-item :label="$t('customs.ledger.ledgerNo')">{{
          currentRow.ledgerNo
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.ledger.ledgerType')">{{
          currentRow.ledgerType === "bonded_logistics"
            ? $t("dict.customsLedgerType.bonded_logistics")
            : currentRow.ledgerType === "process_trade"
              ? $t("dict.customsLedgerType.process_trade")
              : $t("dict.customsLedgerType.export_warehouse")
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.ledger.enterpriseName')">{{
          currentRow.enterpriseName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.ledger.customsCode')">{{
          currentRow.customsCode
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.ledger.supervisionMode')">{{
          supervisionModeOptions.find(
            o => o.value === currentRow.supervisionMode
          )?.label ?? currentRow.supervisionMode
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.status')">{{
          customsLedgerStatusOptions.find(o => o.value === currentRow.status)
            ?.label ?? currentRow.status
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.ledger.validFrom')">{{
          currentRow.validFrom
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.ledger.validTo')">{{
          currentRow.validTo
        }}</el-descriptions-item>
      </el-descriptions>
      <el-table
        v-if="currentRow"
        :data="currentRow.goods || []"
        border
        row-key="gNo"
      >
        <el-table-column
          prop="gNo"
          :label="$t('customs.ledger.gNo')"
          min-width="110"
        />
        <el-table-column
          prop="skuCode"
          :label="$t('customs.ledger.skuCode')"
          min-width="100"
        />
        <el-table-column
          prop="name"
          :label="$t('customs.ledger.goodsName')"
          min-width="140"
        />
        <el-table-column
          prop="unit"
          :label="$t('common.columns.unit')"
          width="70"
          align="center"
        />
        <el-table-column
          prop="declaredQty"
          :label="$t('customs.ledger.declaredQty')"
          width="90"
          align="center"
        />
        <el-table-column
          prop="usedQty"
          :label="$t('customs.ledger.usedQty')"
          width="90"
          align="center"
        />
        <el-table-column
          prop="availQty"
          :label="$t('customs.ledger.availQty')"
          width="90"
          align="center"
        />
      </el-table>
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

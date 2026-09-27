<script setup lang="ts">
import { ref } from "vue";
import { useCustomsVerify } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  customsVerifyTypeOptions,
  customsVerifyStatusOptions,
  supervisionModeOptions,
  dictLabel
} from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "CustomsVerify" });

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
} = useCustomsVerify();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="$t('customs.verify.listNo')" prop="listNo">
        <el-input
          v-model="form.listNo"
          :placeholder="$t('customs.verify.listNo')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('customs.verify.bizNo')" prop="bizNo">
        <el-input
          v-model="form.bizNo"
          :placeholder="$t('customs.verify.bizNoPh')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.type')" prop="listType">
        <el-select
          v-model="form.listType"
          :placeholder="$t('customs.verify.all')"
          clearable
          style="width: 130px"
        >
          <el-option
            v-for="d in customsVerifyTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('customs.verify.supervisionMode')"
        prop="supervisionMode"
      >
        <el-select
          v-model="form.supervisionMode"
          :placeholder="$t('customs.verify.all')"
          clearable
          style="width: 170px"
        >
          <el-option
            v-for="d in supervisionModeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('customs.verify.all')"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="d in customsVerifyStatusOptions"
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
      :title="$t('customs.verify.title')"
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

    <!-- 核注清单详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('customs.verify.detailTitle')"
      size="760px"
    >
      <template v-if="currentRow">
        <el-descriptions :column="2" border class="mb-4">
          <el-descriptions-item :label="$t('customs.verify.listNo')">{{
            currentRow.listNo
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('common.columns.type')">{{
            dictLabel(customsVerifyTypeOptions, currentRow.listType)
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.verify.supervisionMode')">{{
            dictLabel(supervisionModeOptions, currentRow.supervisionMode)
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('common.columns.status')">{{
            dictLabel(customsVerifyStatusOptions, currentRow.status)
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.verify.relBizNo')">{{
            currentRow.bizNo
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.verify.ledgerNo')">{{
            currentRow.ledgerNo
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.verify.packCount')">{{
            currentRow.packCount
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.verify.grossNetWeight')">{{
            `${currentRow.grossWeight} / ${currentRow.netWeight} kg`
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.verify.declareTime')">{{
            currentRow.declareTime || "-"
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.verify.declareBy')">{{
            currentRow.declareBy || "-"
          }}</el-descriptions-item>
          <el-descriptions-item
            v-if="currentRow.refusedReason"
            :label="$t('customs.verify.refusedReason')"
            :span="2"
          >
            <span style="color: var(--el-color-danger)">{{
              currentRow.refusedReason
            }}</span>
          </el-descriptions-item>
        </el-descriptions>
        <div class="mb-2 font-semibold">
          {{ $t("customs.verify.goodsTitle") }}
        </div>
        <el-table :data="currentRow.goods" border row-key="gNo">
          <el-table-column
            prop="gNo"
            :label="$t('customs.verify.gNo')"
            min-width="100"
          />
          <el-table-column
            prop="hsCode"
            :label="$t('customs.verify.hsCode')"
            min-width="110"
          />
          <el-table-column
            prop="name"
            :label="$t('customs.verify.goodsName')"
            min-width="140"
          />
          <el-table-column
            prop="qty"
            :label="$t('customs.verify.declareQty')"
            min-width="90"
            align="center"
          />
          <el-table-column
            prop="unit"
            :label="$t('common.columns.unit')"
            width="70"
            align="center"
          />
          <el-table-column
            prop="price"
            :label="$t('customs.verify.price')"
            min-width="90"
            align="center"
          />
          <el-table-column
            prop="currency"
            :label="$t('customs.verify.currency')"
            width="80"
            align="center"
          />
          <el-table-column
            prop="grossWeight"
            :label="$t('customs.verify.grossWeightKg')"
            min-width="90"
            align="center"
          />
          <el-table-column
            prop="netWeight"
            :label="$t('customs.verify.netWeightKg')"
            min-width="90"
            align="center"
          />
        </el-table>
      </template>
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

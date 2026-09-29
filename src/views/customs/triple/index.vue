<script setup lang="ts">
import { ref } from "vue";
import { useCustomsTriple } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  tripleDocTypeOptions,
  tripleStatusOptions,
  triplePlatformOptions,
  dictLabel
} from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "CustomsTriple" });

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
} = useCustomsTriple();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="$t('customs.triple.docNo')" prop="docNo">
        <el-input
          v-model="form.docNo"
          :placeholder="$t('customs.triple.docNo')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('customs.triple.orderNo')" prop="orderNo">
        <el-input
          v-model="form.orderNo"
          :placeholder="$t('customs.triple.relOrderNo')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('customs.triple.docType')" prop="docType">
        <el-select
          v-model="form.docType"
          :placeholder="$t('customs.triple.all')"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="d in tripleDocTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('customs.triple.platform')" prop="platform">
        <el-select
          v-model="form.platform"
          :placeholder="$t('customs.triple.all')"
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="d in triplePlatformOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('customs.triple.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in tripleStatusOptions"
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
      :title="$t('customs.triple.title')"
      :columns="columns"
      @refresh="onSearch"
    >
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

    <!-- 三单详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('customs.triple.detailTitle')"
      size="460px"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item :label="$t('customs.triple.docNo')">{{
          currentRow.docNo
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.triple.docType')">{{
          dictLabel(tripleDocTypeOptions, currentRow.docType)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.triple.platformFull')">{{
          dictLabel(triplePlatformOptions, currentRow.platform)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.triple.relOrderNo')">{{
          currentRow.orderNo
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.triple.extNo')">{{
          currentRow.extNo
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.triple.amount')">{{
          currentRow.docType === "logistics"
            ? "-"
            : `¥${currentRow.amount.toFixed(2)}`
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.triple.consignee')">{{
          currentRow.consignee
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.triple.matchStatus')">{{
          dictLabel(tripleStatusOptions, currentRow.status)
        }}</el-descriptions-item>
        <el-descriptions-item
          v-if="currentRow.failReason"
          :label="$t('customs.triple.failReason')"
        >
          <span style="color: var(--el-color-danger)">{{
            currentRow.failReason
          }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('customs.triple.pushTime')">{{
          currentRow.pushTime || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.triple.matchTime')">{{
          currentRow.matchTime || "-"
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

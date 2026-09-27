<script setup lang="ts">
import { ref } from "vue";
import { useCustomsRelease } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  releaseDirectionOptions,
  releaseStatusOptions,
  dictLabel
} from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "CustomsRelease" });

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
} = useCustomsRelease();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="$t('customs.release.passNo')" prop="passNo">
        <el-input
          v-model="form.passNo"
          :placeholder="$t('customs.release.passNo')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('customs.release.vehicleNo')" prop="vehicleNo">
        <el-input
          v-model="form.vehicleNo"
          :placeholder="$t('customs.release.vehicleNo')"
          clearable
          style="width: 120px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('customs.release.direction')" prop="direction">
        <el-select
          v-model="form.direction"
          :placeholder="$t('customs.release.all')"
          clearable
          style="width: 100px"
        >
          <el-option
            v-for="d in releaseDirectionOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('customs.release.all')"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="d in releaseStatusOptions"
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
      :title="$t('customs.release.title')"
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

    <!-- 核放单详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('customs.release.detailTitle')"
      size="460px"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item :label="$t('customs.release.passNo')">{{
          currentRow.passNo
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.directionFull')">{{
          dictLabel(releaseDirectionOptions, currentRow.direction)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.vehicleNo')">{{
          currentRow.vehicleNo
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.driver')">{{
          currentRow.driverName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.driverPhone')">{{
          currentRow.driverPhone
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.containerNo')">{{
          currentRow.containerNo || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.relListNo')">{{
          currentRow.listNo
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.relBizNo')">{{
          currentRow.bizNo
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.packCount')">{{
          currentRow.packCount
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.grossWeight')">{{
          `${currentRow.grossWeight} kg`
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.status')">{{
          dictLabel(releaseStatusOptions, currentRow.status)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.declareTime')">{{
          currentRow.declareTime || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.releaseTime')">{{
          currentRow.releaseTime || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customs.release.crossTime')">{{
          currentRow.crossTime || "-"
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

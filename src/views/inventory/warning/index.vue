<script setup lang="ts">
import { ref } from "vue";
import { useWarning } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { warningTypeOptions, warningStatusOptions } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "InventoryWarning" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleSizeChange,
  handleCurrentChange
} = useWarning();

const warehouseOptions = [
  { value: "WH001", label: $t("inventory.warning.whShanghai") },
  { value: "WH002", label: $t("inventory.warning.whGuangzhou") },
  { value: "WH003", label: $t("inventory.warning.whChengdu") }
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
        :label="$t('inventory.warning.warningType')"
        prop="warningType"
      >
        <el-select
          v-model="form.warningType"
          :placeholder="$t('inventory.warning.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in warningTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('inventory.warning.materialCode')"
        prop="materialCode"
      >
        <el-input
          v-model="form.materialCode"
          :placeholder="$t('inventory.warning.materialCode')"
          clearable
          style="width: 130px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('inventory.warning.materialName')"
        prop="materialName"
      >
        <el-input
          v-model="form.materialName"
          :placeholder="$t('inventory.warning.materialName')"
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
          :placeholder="$t('inventory.warning.all')"
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
          :placeholder="$t('inventory.warning.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in warningStatusOptions"
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
      :title="$t('inventory.warning.title')"
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
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>

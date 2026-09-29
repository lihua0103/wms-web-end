<script setup lang="ts">
import { ref } from "vue";
import { useTransaction } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { transactionTypeOptions } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "InventoryTransaction" });

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
} = useTransaction();

const warehouseOptions = [
  { value: "WH001", label: $t("inventory.transaction.whShanghai") },
  { value: "WH002", label: $t("inventory.transaction.whGuangzhou") },
  { value: "WH003", label: $t("inventory.transaction.whChengdu") }
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
        :label="$t('inventory.transaction.transactionNo')"
        prop="transactionNo"
      >
        <el-input
          v-model="form.transactionNo"
          :placeholder="$t('inventory.transaction.transactionNo')"
          clearable
          style="width: 160px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('inventory.transaction.transactionType')"
        prop="transactionType"
      >
        <el-select
          v-model="form.transactionType"
          :placeholder="$t('inventory.transaction.all')"
          clearable
          filterable
          style="width: 150px"
        >
          <el-option
            v-for="d in transactionTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('inventory.transaction.materialCode')"
        prop="materialCode"
      >
        <el-input
          v-model="form.materialCode"
          :placeholder="$t('inventory.transaction.materialCode')"
          clearable
          style="width: 130px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('inventory.transaction.materialName')"
        prop="materialName"
      >
        <el-input
          v-model="form.materialName"
          :placeholder="$t('inventory.transaction.materialName')"
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
          :placeholder="$t('inventory.transaction.all')"
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
      <el-form-item :label="$t('inventory.transaction.bizNo')" prop="bizNo">
        <el-input
          v-model="form.bizNo"
          :placeholder="$t('inventory.transaction.bizNo')"
          clearable
          style="width: 140px"
          @keyup.enter="onSearch"
        />
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
      :title="$t('inventory.transaction.title')"
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

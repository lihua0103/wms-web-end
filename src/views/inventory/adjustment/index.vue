<script setup lang="ts">
import { ref } from "vue";
import { useAdjustment } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { adjustTypeOptions, adjustStatusOptions } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import AddFill from "~icons/ep/plus";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "InventoryAdjustment" });

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
  handleSizeChange,
  handleCurrentChange
} = useAdjustment();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="$t('inventory.adjustment.docNo')" prop="code">
        <el-input
          v-model="form.code"
          :placeholder="$t('inventory.adjustment.adjustNo')"
          clearable
          style="width: 170px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('inventory.adjustment.adjustType')"
        prop="adjustType"
      >
        <el-select
          v-model="form.adjustType"
          :placeholder="$t('inventory.adjustment.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in adjustTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('inventory.adjustment.materialCode')"
        prop="materialCode"
      >
        <el-input
          v-model="form.materialCode"
          :placeholder="$t('inventory.adjustment.materialCode')"
          clearable
          style="width: 130px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('inventory.adjustment.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="d in adjustStatusOptions"
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
      :title="$t('inventory.adjustment.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog"
        >
          {{ $t("inventory.adjustment.addTitle") }}
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
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>

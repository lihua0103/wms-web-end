<script setup lang="ts">
import { ref } from "vue";
import { useMaterial } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { $t } from "@/plugins/i18n";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import AddFill from "~icons/ep/plus";

defineOptions({ name: "MasterMaterial" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  detailVisible,
  currentRow,
  materialCategoryOptions,
  onSearch,
  resetForm,
  openDialog,
  handleSizeChange,
  handleCurrentChange
} = useMaterial();

const serialOptions = [
  { value: 1, label: $t("master.material.yes") },
  { value: 0, label: $t("master.material.no") }
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
      <el-form-item :label="$t('common.columns.code')" prop="code">
        <el-input
          v-model="form.code"
          :placeholder="$t('master.material.code')"
          clearable
          style="width: 140px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.name')" prop="name">
        <el-input
          v-model="form.name"
          :placeholder="$t('master.material.name')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('master.material.category')" prop="category">
        <el-select
          v-model="form.category"
          :placeholder="$t('master.material.all')"
          clearable
          style="width: 130px"
        >
          <el-option
            v-for="d in materialCategoryOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('master.material.serial')" prop="isSerial">
        <el-select
          v-model="form.isSerial"
          :placeholder="$t('master.material.all')"
          clearable
          style="width: 100px"
        >
          <el-option
            v-for="s in serialOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
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
      :title="$t('master.material.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('master.material.addTitle'))"
        >
          {{ $t("master.material.addTitle") }}
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

    <!-- 物料详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('master.material.detailTitle')"
      size="420px"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item :label="$t('master.material.code')">{{
          currentRow.code
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('master.material.name')">{{
          currentRow.name
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('master.material.spec')">{{
          currentRow.spec || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.unit')">{{
          currentRow.unit || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('master.material.barcode')">{{
          currentRow.barcode || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.owner')">{{
          currentRow.ownerName || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('master.material.safetyQty')">{{
          currentRow.safetyQty
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('master.material.price')"
          >{{ currentRow.price }}
          {{ $t("master.material.currency") }}</el-descriptions-item
        >
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

<script setup lang="ts">
import { ref } from "vue";
import { $t } from "@/plugins/i18n";
import { useWave } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import MagicStick from "~icons/ep/magic-stick";

defineOptions({ name: "OutboundWave" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  statusMap,
  onSearch,
  resetForm,
  openGenerateDialog,
  handleSizeChange,
  handleCurrentChange
} = useWave();

const warehouseOptions = [
  { value: "WH001", label: $t("outbound.wave.whShanghai") },
  { value: "WH002", label: $t("outbound.wave.whGuangzhou") },
  { value: "WH003", label: $t("outbound.wave.whChengdu") }
];

const statusOptions = [
  { value: "pending", label: $t("outbound.wave.statusPending") },
  { value: "processing", label: $t("outbound.wave.statusProcessing") },
  { value: "finished", label: $t("outbound.wave.statusFinished") },
  { value: "cancelled", label: $t("outbound.wave.statusCancelled") }
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
      <el-form-item :label="$t('outbound.wave.no')" prop="code">
        <el-input
          v-model="form.code"
          :placeholder="$t('outbound.wave.no')"
          clearable
          style="width: 160px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('common.columns.warehouse')"
        prop="warehouseCode"
      >
        <el-select
          v-model="form.warehouseCode"
          :placeholder="$t('outbound.wave.all')"
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
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('outbound.wave.all')"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="s in statusOptions"
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
      :title="$t('outbound.wave.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(MagicStick)"
          @click="openGenerateDialog"
        >
          {{ $t("outbound.wave.generate") }}
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

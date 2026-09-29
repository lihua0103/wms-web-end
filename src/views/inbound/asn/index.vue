<script setup lang="ts">
import { ref } from "vue";
import { $t } from "@/plugins/i18n";
import { useAsn } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { inboundTypeOptions } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import AddFill from "~icons/ep/plus";

defineOptions({ name: "InboundAsn" });

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
  openDialog,
  handleSizeChange,
  handleCurrentChange
} = useAsn();

const warehouseOptions = [
  { value: "WH001", label: $t("inbound.asn.whShanghai") },
  { value: "WH002", label: $t("inbound.asn.whGuangzhou") },
  { value: "WH003", label: $t("inbound.asn.whChengdu") }
];

const statusOptions = [
  { value: "draft", label: $t("inbound.asn.statusDraft") },
  { value: "pending", label: $t("inbound.asn.statusPending") },
  { value: "approved", label: $t("inbound.asn.statusApproved") },
  { value: "finished", label: $t("inbound.asn.statusFinished") },
  { value: "cancelled", label: $t("inbound.asn.statusCancelled") }
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
      <el-form-item :label="$t('inbound.asn.code')" prop="code">
        <el-input
          v-model="form.code"
          :placeholder="$t('inbound.asn.asnNo')"
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
          :placeholder="$t('inbound.asn.all')"
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
      <el-form-item :label="$t('common.columns.type')" prop="type">
        <el-select
          v-model="form.type"
          :placeholder="$t('inbound.asn.all')"
          clearable
          style="width: 130px"
        >
          <el-option
            v-for="d in inboundTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('inbound.asn.all')"
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
      :title="$t('inbound.asn.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog($t('inbound.asn.add'))"
        >
          {{ $t("inbound.asn.add") }}
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

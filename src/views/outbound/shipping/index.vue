<script setup lang="ts">
import { ref } from "vue";
import { $t } from "@/plugins/i18n";
import { useShipping } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "OutboundShipping" });

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
  handleSizeChange,
  handleCurrentChange
} = useShipping();

const carrierOptions = [
  { value: "顺丰速运", label: $t("outbound.shipping.carrierSF") },
  { value: "京东物流", label: $t("outbound.shipping.carrierJD") },
  { value: "德邦快递", label: $t("outbound.shipping.carrierDeppon") },
  { value: "自有车队", label: $t("outbound.shipping.carrierSelf") }
];

const statusOptions = [
  { value: "waiting", label: $t("outbound.shipping.statusWaiting") },
  { value: "shipped", label: $t("outbound.shipping.statusShipped") },
  { value: "finished", label: $t("outbound.shipping.statusFinished") }
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
      <el-form-item :label="$t('outbound.shipping.no')" prop="code">
        <el-input
          v-model="form.code"
          :placeholder="$t('outbound.shipping.code')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('outbound.shipping.carrier')" prop="carrierName">
        <el-select
          v-model="form.carrierName"
          :placeholder="$t('outbound.shipping.all')"
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="c in carrierOptions"
            :key="c.value"
            :label="c.label"
            :value="c.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('outbound.shipping.all')"
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
      :title="$t('outbound.shipping.title')"
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

<script setup lang="ts">
import { ref } from "vue";
import { $t } from "@/plugins/i18n";
import { useApiLog } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  apiDirectionOptions,
  apiLogStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "IntegrationApiLog" });

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
} = useApiLog();

/** 对接系统下拉（与集成配置种子保持一致） */
const systemNameOptions = [
  { value: "用友 U8 ERP", label: $t("integration.apiLog.sysYonyou") },
  { value: "订单中台 OMS", label: $t("integration.apiLog.sysOms") },
  { value: "汇川 WCS 设备层", label: $t("integration.apiLog.sysWcs") },
  { value: "快递鸟 TMS", label: $t("integration.apiLog.sysTms") },
  { value: "天猫电商平台", label: $t("integration.apiLog.sysTmall") },
  { value: "京东电商平台", label: $t("integration.apiLog.sysJd") }
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
        :label="$t('integration.apiLog.requestId')"
        prop="requestId"
      >
        <el-input
          v-model="form.requestId"
          :placeholder="$t('integration.apiLog.requestIdPh')"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('integration.apiLog.system')" prop="systemName">
        <el-select
          v-model="form.systemName"
          :placeholder="$t('integration.apiLog.all')"
          clearable
          filterable
          style="width: 170px"
        >
          <el-option
            v-for="s in systemNameOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('integration.apiLog.apiPath')" prop="apiPath">
        <el-input
          v-model="form.apiPath"
          :placeholder="$t('integration.apiLog.apiPath')"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        :label="$t('integration.apiLog.direction')"
        prop="direction"
      >
        <el-select
          v-model="form.direction"
          :placeholder="$t('integration.apiLog.all')"
          clearable
          style="width: 170px"
        >
          <el-option
            v-for="d in apiDirectionOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('integration.apiLog.all')"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="d in apiLogStatusOptions"
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
      :title="$t('integration.apiLog.title')"
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

    <!-- 接口日志详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('integration.apiLog.detailTitle')"
      size="500px"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item :label="$t('integration.apiLog.requestId')">{{
          currentRow.requestId
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('integration.apiLog.systemName')">{{
          currentRow.systemName
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('integration.apiLog.apiPath')">{{
          currentRow.apiPath
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('integration.apiLog.direction')">{{
          dictLabel(apiDirectionOptions, currentRow.direction)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('integration.apiLog.duration')"
          >{{ currentRow.duration }} ms</el-descriptions-item
        >
        <el-descriptions-item :label="$t('common.columns.status')">
          <el-tag :type="dictTag(apiLogStatusOptions, currentRow.status)">
            {{ dictLabel(apiLogStatusOptions, currentRow.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.createTime')">{{
          currentRow.createdAt
        }}</el-descriptions-item>
        <el-descriptions-item
          v-if="currentRow.errorMsg"
          :label="$t('integration.apiLog.errorMsg')"
        >
          <span style="color: var(--el-color-danger); word-break: break-all">
            {{ currentRow.errorMsg }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
      <template v-if="currentRow?.requestSummary">
        <div class="mb-1 mt-4 font-bold">
          {{ $t("integration.apiLog.requestSummary") }}
        </div>
        <pre class="log-pre">{{ currentRow.requestSummary }}</pre>
      </template>
      <template v-if="currentRow?.responseSummary">
        <div class="mb-1 mt-4 font-bold">
          {{ $t("integration.apiLog.responseSummary") }}
        </div>
        <pre class="log-pre">{{ currentRow.responseSummary }}</pre>
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

.log-pre {
  max-height: 200px;
  padding: 8px 12px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>

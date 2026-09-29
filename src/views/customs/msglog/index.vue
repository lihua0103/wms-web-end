<script setup lang="ts">
import { ref } from "vue";
import { useCustomsMsgLog } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  customsMsgTypeOptions,
  customsChannelOptions,
  customsMsgStatusOptions,
  dictLabel
} from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "CustomsMsgLog" });

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
} = useCustomsMsgLog();

function pretty(json?: string) {
  if (!json) return "";
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
}
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="$t('customs.msglog.msgNo')" prop="msgNo">
        <el-input
          v-model="form.msgNo"
          :placeholder="$t('customs.msglog.msgNo')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('customs.msglog.bizNo')" prop="bizNo">
        <el-input
          v-model="form.bizNo"
          :placeholder="$t('customs.msglog.bizNoPh')"
          clearable
          style="width: 150px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('customs.msglog.msgType')" prop="msgType">
        <el-select
          v-model="form.msgType"
          :placeholder="$t('customs.msglog.all')"
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="d in customsMsgTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('customs.msglog.channel')" prop="channel">
        <el-select
          v-model="form.channel"
          :placeholder="$t('customs.msglog.all')"
          clearable
          style="width: 170px"
        >
          <el-option
            v-for="d in customsChannelOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('customs.msglog.all')"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="d in customsMsgStatusOptions"
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
      :title="$t('customs.msglog.title')"
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

    <!-- 报文详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('customs.msglog.detailTitle')"
      size="620px"
    >
      <template v-if="currentRow">
        <el-descriptions :column="2" border class="mb-4">
          <el-descriptions-item :label="$t('customs.msglog.msgNo')">{{
            currentRow.msgNo
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.msglog.msgType')">{{
            dictLabel(customsMsgTypeOptions, currentRow.msgType)
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.msglog.channel')">{{
            dictLabel(customsChannelOptions, currentRow.channel)
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.msglog.direction')">{{
            currentRow.direction === "up"
              ? $t("dict.customsMsgDirection.up")
              : $t("dict.customsMsgDirection.down")
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.msglog.bizNoPh')">{{
            currentRow.bizNo
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('common.columns.status')">{{
            dictLabel(customsMsgStatusOptions, currentRow.status)
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.msglog.resendCount')">{{
            currentRow.resendCount
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('customs.msglog.createdAt')">{{
            currentRow.createdAt
          }}</el-descriptions-item>
          <el-descriptions-item
            v-if="currentRow.errorMsg"
            :label="$t('customs.msglog.errorMsg')"
            :span="2"
          >
            <span style="color: var(--el-color-danger)">{{
              currentRow.errorMsg
            }}</span>
          </el-descriptions-item>
        </el-descriptions>
        <div class="mb-2 font-semibold">
          {{ $t("customs.msglog.requestMsg") }}
        </div>
        <pre class="msg-pre">{{ pretty(currentRow.content) }}</pre>
        <div v-if="currentRow.response" class="mb-2 mt-4 font-semibold">
          {{ $t("customs.msglog.responseMsg") }}
        </div>
        <pre v-if="currentRow.response" class="msg-pre">{{
          pretty(currentRow.response)
        }}</pre>
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

.msg-pre {
  max-height: 300px;
  padding: 12px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
  word-break: break-all;
  white-space: pre-wrap;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}
</style>

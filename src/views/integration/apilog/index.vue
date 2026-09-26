<script setup lang="ts">
import { ref } from "vue";
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
import View from "~icons/ep/view";

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
  openDetail,
  handleSizeChange,
  handleCurrentChange
} = useApiLog();

/** 对接系统下拉（与集成配置种子保持一致） */
const systemNameOptions = [
  "用友 U8 ERP",
  "订单中台 OMS",
  "汇川 WCS 设备层",
  "快递鸟 TMS",
  "天猫电商平台",
  "京东电商平台"
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
      <el-form-item label="请求 ID" prop="requestId">
        <el-input
          v-model="form.requestId"
          placeholder="请求跟踪 ID"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="系统" prop="systemName">
        <el-select
          v-model="form.systemName"
          placeholder="全部"
          clearable
          filterable
          style="width: 170px"
        >
          <el-option
            v-for="s in systemNameOptions"
            :key="s"
            :label="s"
            :value="s"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="接口路径" prop="apiPath">
        <el-input
          v-model="form.apiPath"
          placeholder="接口路径"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item label="方向" prop="direction">
        <el-select
          v-model="form.direction"
          placeholder="全部"
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
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="全部"
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
          >搜索</el-button
        >
        <el-button
          :icon="useRenderIcon(RefreshIcon)"
          @click="resetForm(searchFormRef)"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <PureTableBar title="接口日志" :columns="columns" @refresh="onSearch">
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
        >
          <template #operation="{ row }">
            <el-button
              link
              type="primary"
              :icon="useRenderIcon(View)"
              @click="openDetail(row)"
            >
              详情
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 接口日志详情 -->
    <el-drawer v-model="detailVisible" title="接口日志详情" size="500px">
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item label="请求 ID">{{
          currentRow.requestId
        }}</el-descriptions-item>
        <el-descriptions-item label="系统名称">{{
          currentRow.systemName
        }}</el-descriptions-item>
        <el-descriptions-item label="接口路径">{{
          currentRow.apiPath
        }}</el-descriptions-item>
        <el-descriptions-item label="方向">{{
          dictLabel(apiDirectionOptions, currentRow.direction)
        }}</el-descriptions-item>
        <el-descriptions-item label="耗时"
          >{{ currentRow.duration }} ms</el-descriptions-item
        >
        <el-descriptions-item label="状态">
          <el-tag :type="dictTag(apiLogStatusOptions, currentRow.status)">
            {{ dictLabel(apiLogStatusOptions, currentRow.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          currentRow.createdAt
        }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.errorMsg" label="错误信息">
          <span style="color: var(--el-color-danger); word-break: break-all">
            {{ currentRow.errorMsg }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
      <template v-if="currentRow?.requestSummary">
        <div class="mb-1 mt-4 font-bold">请求摘要</div>
        <pre class="log-pre">{{ currentRow.requestSummary }}</pre>
      </template>
      <template v-if="currentRow?.responseSummary">
        <div class="mb-1 mt-4 font-bold">响应摘要</div>
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
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>

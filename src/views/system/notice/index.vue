<script setup lang="ts">
import { ref } from "vue";
import {
  useNotice,
  noticeTypeOptions,
  noticeLevelOptions,
  readStatusOptions
} from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { dictTag, dictLabel } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";
import Check from "~icons/ep/check";
import Bell from "~icons/ep/bell";

defineOptions({ name: "SystemNotice" });

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
  openDialog,
  handleRead,
  handleSizeChange,
  handleCurrentChange
} = useNotice();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="$t('system.notice.title')" prop="keyword">
        <el-input
          v-model="form.keyword"
          :placeholder="$t('system.notice.keywordPh')"
          clearable
          style="width: 200px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.type')" prop="type">
        <el-select
          v-model="form.type"
          :placeholder="$t('system.notice.all')"
          clearable
          style="width: 130px"
        >
          <el-option
            v-for="d in noticeTypeOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('system.notice.all')"
          clearable
          style="width: 130px"
        >
          <el-option
            v-for="d in readStatusOptions"
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
        >
          {{ $t("common.buttons.search") }}
        </el-button>
        <el-button
          :icon="useRenderIcon(RefreshIcon)"
          @click="resetForm(searchFormRef)"
        >
          {{ $t("common.buttons.reset") }}
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      :title="$t('system.notice.titleBar')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(Bell)"
          @click="openDialog($t('system.notice.publish'))"
        >
          {{ $t("system.notice.publish") }}
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

    <!-- 消息详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="currentRow?.title || $t('system.notice.detailTitle')"
      size="460px"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item :label="$t('common.columns.type')">
          <el-tag :type="dictTag(noticeTypeOptions, currentRow.type) as any">
            {{ dictLabel(noticeTypeOptions, currentRow.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('system.notice.level')">
          <el-tag :type="dictTag(noticeLevelOptions, currentRow.level) as any">
            {{ dictLabel(noticeLevelOptions, currentRow.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('common.columns.status')">
          <el-tag :type="dictTag(readStatusOptions, currentRow.status) as any">
            {{ dictLabel(readStatusOptions, currentRow.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('system.notice.publisher')">{{
          currentRow.publisher
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system.notice.publishTime')">{{
          currentRow.createdAt
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="mt-4">
        <div class="mb-2 font-bold">{{ $t("system.notice.contentTitle") }}</div>
        <p class="leading-6 whitespace-pre-wrap text-gray-600">
          {{ currentRow?.content || "-" }}
        </p>
      </div>
      <template #footer>
        <el-button
          v-if="currentRow?.status === 0"
          type="primary"
          :icon="useRenderIcon(Check)"
          @click="currentRow && handleRead(currentRow)"
        >
          {{ $t("system.notice.markRead") }}
        </el-button>
        <el-button @click="detailVisible = false">
          {{ $t("common.buttons.close") }}
        </el-button>
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
</style>

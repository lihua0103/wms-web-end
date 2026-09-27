<script setup lang="ts">
import { ref } from "vue";
import { useLog, logStatusOptions } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { dictTag, dictLabel } from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "SystemLog" });

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
} = useLog();
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item :label="$t('system.log.keyword')" prop="keyword">
        <el-input
          v-model="form.keyword"
          :placeholder="$t('system.log.keywordPh')"
          clearable
          style="width: 200px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('system.log.result')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('system.log.all')"
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="d in logStatusOptions"
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
      :title="$t('system.log.title')"
      :columns="columns"
      @refresh="onSearch"
    >
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

    <!-- 日志详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('system.log.detailTitle')"
      size="420px"
    >
      <el-descriptions v-if="currentRow" :column="1" border>
        <el-descriptions-item :label="$t('system.log.operator')">{{
          currentRow.username
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system.log.module')">{{
          currentRow.module
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system.log.action')">{{
          currentRow.action
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system.log.ip')">{{
          currentRow.ip
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('system.log.result')">
          <el-tag :type="dictTag(logStatusOptions, currentRow.status) as any">
            {{ dictLabel(logStatusOptions, currentRow.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('system.log.duration')"
          >{{ currentRow.duration }} ms</el-descriptions-item
        >
        <el-descriptions-item :label="$t('system.log.time')">{{
          currentRow.createdAt
        }}</el-descriptions-item>
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

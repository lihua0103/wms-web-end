<script setup lang="ts">
import { ref } from "vue";
import { useAiRun, fmtDuration } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  dictLabel,
  aiSceneOptions,
  aiRunStatusOptions,
  aiNodeTypeOptions
} from "@/constants/wms";
import SearchIcon from "~icons/ep/search";
import RefreshIcon from "~icons/ep/refresh";

defineOptions({ name: "AiRun" });

const searchFormRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  detailVisible,
  detailLoading,
  currentRow,
  currentSteps,
  stepTagType,
  stepStatusLabel,
  handleSizeChange,
  handleCurrentChange
} = useAiRun();

/** 时间线节点颜色 */
function timelineColor(status: string) {
  return {
    success: "var(--el-color-success)",
    failed: "var(--el-color-danger)",
    running: "var(--el-color-warning)",
    pending: "var(--el-color-info-light-5)",
    skipped: "var(--el-color-info-light-5)"
  }[status];
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
      <el-form-item :label="$t('ai.run.runNo')" prop="runNo">
        <el-input
          v-model="form.runNo"
          :placeholder="$t('ai.run.runNoPh')"
          clearable
          style="width: 180px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('ai.run.workflow')" prop="workflowName">
        <el-input
          v-model="form.workflowName"
          :placeholder="$t('ai.run.workflowPh')"
          clearable
          style="width: 170px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item :label="$t('common.columns.status')" prop="status">
        <el-select
          v-model="form.status"
          :placeholder="$t('ai.run.allPh')"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="d in aiRunStatusOptions"
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
      :title="$t('ai.run.title')"
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

    <!-- 运行详情 -->
    <el-drawer
      v-model="detailVisible"
      :title="$t('ai.run.detailTitle')"
      size="520px"
    >
      <div v-loading="detailLoading">
        <el-descriptions v-if="currentRow" :column="2" border>
          <el-descriptions-item :label="$t('ai.run.runNo')" :span="2">{{
            currentRow.runNo
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ai.run.workflow')" :span="2">{{
            currentRow.workflowName
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ai.run.scene')">{{
            dictLabel(aiSceneOptions, currentRow.scene)
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ai.run.triggerType')">{{
            currentRow.triggerType === "manual"
              ? $t("ai.run.manualTrigger")
              : currentRow.triggerType === "scheduled"
                ? $t("ai.run.scheduledTrigger")
                : $t("ai.run.eventTrigger")
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('common.columns.status')">
            <el-tag :type="stepTagType(currentRow.status)">
              {{ dictLabel(aiRunStatusOptions, currentRow.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('ai.run.stepProgress')"
            >{{ currentRow.stepDone }}/{{
              currentRow.stepTotal
            }}</el-descriptions-item
          >
          <el-descriptions-item :label="$t('ai.run.totalDuration')">{{
            fmtDuration(currentRow.duration)
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ai.run.tokenUsage')">{{
            currentRow.tokens?.toLocaleString?.() ?? "-"
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ai.run.operator')">{{
            currentRow.operator
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ai.run.startedAt')">{{
            currentRow.startedAt || "-"
          }}</el-descriptions-item>
          <el-descriptions-item
            v-if="currentRow.errorMsg"
            :label="$t('ai.run.failReason')"
            :span="2"
          >
            <span class="err-msg">{{ currentRow.errorMsg }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="steps-title">{{ $t("ai.run.stepTimeline") }}</div>
        <el-timeline v-if="currentSteps.length" class="run-timeline">
          <el-timeline-item
            v-for="(s, i) in currentSteps"
            :key="i"
            :color="timelineColor(s.status)"
            :timestamp="
              $t('ai.run.stepDuration', { duration: fmtDuration(s.duration) })
            "
            placement="top"
          >
            <div class="step-head">
              <span class="name">{{ i + 1 }}. {{ s.name }}</span>
              <span class="meta">
                <el-tag size="small" effect="plain">
                  {{ dictLabel(aiNodeTypeOptions, s.type) }}
                </el-tag>
                <el-tag size="small" :type="stepTagType(s.status)">
                  {{ stepStatusLabel(s.status) }}
                </el-tag>
              </span>
            </div>
            <div v-if="s.input" class="io">
              {{ $t("ai.run.inputLabel") }}{{ s.input }}
            </div>
            <div v-if="s.output && s.status !== 'pending'" class="io">
              {{ $t("ai.run.outputLabel") }}{{ s.output }}
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty
          v-else-if="!detailLoading"
          :description="$t('ai.run.noSteps')"
        />
      </div>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

:deep(.step-progress) {
  color: var(--el-text-color-secondary);

  &.ok {
    color: var(--el-color-success);
  }
}

.steps-title {
  margin: 18px 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.run-timeline {
  padding-left: 6px;

  .step-head {
    display: flex;
    gap: 8px;
    align-items: center;

    .name {
      font-size: 13.5px;
      font-weight: 500;
    }

    .meta {
      display: flex;
      gap: 4px;
    }
  }

  .io {
    margin-top: 4px;
    font-size: 12.5px;
    color: var(--el-text-color-secondary);
  }
}

.err-msg {
  color: var(--el-color-danger);
}
</style>

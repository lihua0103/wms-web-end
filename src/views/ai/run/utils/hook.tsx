import { reactive, ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { $t } from "@/plugins/i18n";
import { getAiRunPage, getAiRunDetail, retryAiRun } from "@/api/ai";
import type { AiRunItem, AiRunStepItem } from "@/api/ai";
import type { DictItem } from "@/constants/wms";
import {
  aiSceneOptions,
  aiTriggerOptions,
  aiRunStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import View from "~icons/ep/view";
import RefreshRight from "~icons/ep/refresh-right";

/** 耗时格式化：ms → 可读 */
export function fmtDuration(ms?: number): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  return s < 60
    ? `${s.toFixed(1)}s`
    : `${Math.floor(s / 60)}m${Math.round(s % 60)}s`;
}

/** 运行步骤状态（比运行记录多 pending/skipped 两态） */
export const stepStatusOptions: DictItem[] = [
  { label: $t("ai.run.stepStatus.running"), value: "running", tag: "warning" },
  { label: $t("ai.run.stepStatus.success"), value: "success", tag: "success" },
  { label: $t("ai.run.stepStatus.failed"), value: "failed", tag: "danger" },
  { label: $t("ai.run.stepStatus.pending"), value: "pending", tag: "info" },
  { label: $t("ai.run.stepStatus.skipped"), value: "skipped", tag: "info" }
];

export function useAiRun() {
  const form = reactive({
    runNo: "",
    workflowName: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<AiRunItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("ai.run.runNo"), prop: "runNo", minWidth: 150 },
    { label: $t("ai.run.workflow"), prop: "workflowName", minWidth: 150 },
    {
      label: $t("ai.run.scene"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(aiSceneOptions, row.scene)}>
          {dictLabel(aiSceneOptions, row.scene)}
        </el-tag>
      )
    },
    {
      label: $t("ai.run.triggerType"),
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(aiTriggerOptions, row.triggerType)
    },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(aiRunStatusOptions, row.status)}>
          {dictLabel(aiRunStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("ai.run.stepProgress"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <span
          class={{ "step-progress": true, ok: row.stepDone === row.stepTotal }}
        >
          {row.stepDone}/{row.stepTotal}
        </span>
      )
    },
    {
      label: $t("ai.run.duration"),
      minWidth: 80,
      cellRenderer: ({ row }) => fmtDuration(row.duration)
    },
    {
      label: $t("ai.run.tokenCol"),
      minWidth: 90,
      cellRenderer: ({ row }) => row.tokens?.toLocaleString?.() ?? "-"
    },
    { label: $t("ai.run.operator"), prop: "operator", minWidth: 100 },
    { label: $t("ai.run.startedAt"), prop: "startedAt", minWidth: 160 },
    {
      fixed: "right",
      label: $t("common.columns.operation"),
      minWidth: 190,
      showOverflowTooltip: false,
      cellRenderer: ({ row }) => (
        <ReTableOperation buttons={operationButtons(row)} />
      )
    }
  ];

  function operationButtons(row: AiRunItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.detail"),
        icon: View,
        onClick: () => openDetail(row)
      }
    ];
    if (row.status === "failed") {
      buttons.push({
        label: $t("ai.run.retry"),
        type: "warning",
        icon: RefreshRight,
        onClick: () => handleRetry(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getAiRunPage({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...form
      });
      dataList.value = data.list;
      pagination.total = data.total;
    } finally {
      loading.value = false;
    }
  }

  function resetForm(formEl: { resetFields: () => void }) {
    formEl.resetFields();
    onSearch();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  // ---- 详情抽屉 ----
  const detailVisible = ref(false);
  const detailLoading = ref(false);
  const currentRow = ref<AiRunItem>();
  const currentSteps = ref<AiRunStepItem[]>([]);

  async function openDetail(row: AiRunItem) {
    currentRow.value = row;
    detailVisible.value = true;
    detailLoading.value = true;
    try {
      const { data } = await getAiRunDetail(row.id);
      currentRow.value = data;
      currentSteps.value = data.steps ?? [];
    } finally {
      detailLoading.value = false;
    }
  }

  /** 失败重试 */
  function handleRetry(row: AiRunItem) {
    retryAiRun(row.id).then(({ msg }) => {
      message(msg || $t("ai.run.retryQueued"), { type: "success" });
      onSearch();
    });
  }

  /** 步骤状态标签（el-tag type 取值放宽以匹配组件类型） */
  function stepTagType(status: string): any {
    return dictTag(stepStatusOptions, status);
  }

  function stepStatusLabel(status: string) {
    return dictLabel(stepStatusOptions, status);
  }

  onMounted(() => {
    onSearch();
  });

  return {
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
    openDetail,
    handleRetry,
    stepTagType,
    stepStatusLabel,
    fmtDuration,
    handleSizeChange,
    handleCurrentChange
  };
}

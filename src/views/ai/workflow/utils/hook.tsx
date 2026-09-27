import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { $t } from "@/plugins/i18n";
import {
  getAiWorkflowPage,
  addAiWorkflow,
  updateAiWorkflow,
  deleteAiWorkflow,
  toggleAiWorkflow,
  runAiWorkflow
} from "@/api/ai";
import type { AiWorkflowItem, AiWorkflowStep } from "@/api/ai";
import {
  aiSceneOptions,
  aiTriggerOptions,
  aiModelOptions,
  aiNodeTypeOptions,
  aiWorkflowStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import VideoPlay from "~icons/ep/video-play";
import SwitchButton from "~icons/ep/switch-button";
import formComp from "../form.vue";

export function useAiWorkflow() {
  const form = reactive({
    name: "",
    scene: "",
    status: "",
    triggerType: ""
  });
  const loading = ref(false);
  const dataList = ref<AiWorkflowItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("common.columns.code"), prop: "code", minWidth: 110 },
    { label: $t("ai.workflow.name"), prop: "name", minWidth: 150 },
    {
      label: $t("ai.workflow.scene"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(aiSceneOptions, row.scene)}>
          {dictLabel(aiSceneOptions, row.scene)}
        </el-tag>
      )
    },
    {
      label: $t("ai.workflow.triggerType"),
      minWidth: 130,
      cellRenderer: ({ row }) => (
        <span>
          {dictLabel(aiTriggerOptions, row.triggerType)}
          {row.triggerType === "scheduled" && row.cronExpr ? (
            <el-tooltip content={row.cronExpr}>
              <span class="cron-hint">
                {$t("ai.workflow.cronExprTag", { cron: row.cronExpr })}
              </span>
            </el-tooltip>
          ) : null}
        </span>
      )
    },
    {
      label: $t("ai.workflow.model"),
      minWidth: 110,
      cellRenderer: ({ row }) => dictLabel(aiModelOptions, row.model)
    },
    {
      label: $t("ai.workflow.steps"),
      minWidth: 90,
      cellRenderer: ({ row }) =>
        $t("ai.workflow.stepSummary", {
          count: row.steps?.length ?? 0,
          type: dictLabel(aiNodeTypeOptions, row.steps?.[0]?.type ?? "start")
        })
    },
    { label: $t("ai.workflow.runCount"), prop: "runCount", minWidth: 85 },
    {
      label: $t("ai.workflow.successRate"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <span
          class={
            row.successRate >= 95
              ? "rate-good"
              : row.successRate >= 90
                ? "rate-mid"
                : "rate-low"
          }
        >
          {row.successRate}%
        </span>
      )
    },
    { label: $t("ai.workflow.lastRun"), prop: "lastRunAt", minWidth: 150 },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(aiWorkflowStatusOptions, row.status)}>
          {dictLabel(aiWorkflowStatusOptions, row.status)}
        </el-tag>
      )
    },
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

  function operationButtons(row: AiWorkflowItem): TableOperationButton[] {
    return [
      {
        label: $t("ai.workflow.run"),
        type: "success",
        icon: VideoPlay,
        disabled: row.status !== "enabled",
        onClick: () => handleRun(row)
      },
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("ai.workflow.editTitle"), row)
      },
      {
        label:
          row.status === "enabled"
            ? $t("common.buttons.disabled")
            : $t("common.buttons.enabled"),
        type: row.status === "enabled" ? "warning" : "success",
        icon: SwitchButton,
        onClick: () => handleToggle(row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      }
    ];
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getAiWorkflowPage({
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

  /** 新增/编辑工作流弹窗 */
  function openDialog(title: string, row?: AiWorkflowItem) {
    const steps: AiWorkflowStep[] = row?.steps?.length
      ? row.steps.map(s => ({ name: s.name, type: s.type }))
      : [
          { name: $t("ai.workflow.defaultStepReceive"), type: "start" },
          { name: $t("ai.workflow.defaultStepAnalyze"), type: "llm" },
          { name: $t("ai.workflow.defaultStepAction"), type: "tool" },
          { name: $t("ai.workflow.defaultStepOutput"), type: "end" }
        ];
    addDialog({
      title,
      width: "56%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          code: row?.code ?? "",
          name: row?.name ?? "",
          scene: row?.scene ?? "inventory",
          triggerType: row?.triggerType ?? "manual",
          cronExpr: row?.cronExpr ?? "",
          model: row?.model ?? "glm-4.7",
          status: row?.status ?? "enabled",
          description: row?.description ?? "",
          steps
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<AiWorkflowItem> }
        ).formInline;
        if (!formInline.steps?.length) {
          message($t("ai.workflow.stepRequired"), { type: "warning" });
          return;
        }
        const req = formInline.id
          ? updateAiWorkflow(formInline)
          : addAiWorkflow(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("ai.workflow.updateSuccess")
              : $t("ai.workflow.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  /** 手动触发一次运行 */
  function handleRun(row: AiWorkflowItem) {
    if (row.status !== "enabled") {
      message($t("ai.workflow.disabledTip"), { type: "warning" });
      return;
    }
    runAiWorkflow(row.id).then(({ data }) => {
      message($t("ai.workflow.runTriggered", { runNo: data?.runNo ?? "-" }), {
        type: "success"
      });
      onSearch();
    });
  }

  /** 启停切换 */
  function handleToggle(row: AiWorkflowItem) {
    const enable = row.status !== "enabled";
    toggleAiWorkflow(row.id, enable).then(() => {
      message(
        enable ? $t("ai.workflow.enabledMsg") : $t("ai.workflow.disabledMsg"),
        { type: "success" }
      );
      onSearch();
    });
  }

  function handleDelete(row: AiWorkflowItem) {
    ElMessageBox.confirm(
      $t("ai.workflow.confirmDeleteName", { name: row.name }),
      $t("ai.workflow.tip"),
      { type: "warning" }
    ).then(() => {
      deleteAiWorkflow([row.id]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
        onSearch();
      });
    });
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
    openDialog,
    handleRun,
    handleToggle,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

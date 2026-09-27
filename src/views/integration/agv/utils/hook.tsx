import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { $t } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getAgvTaskPage,
  dispatchAgvTask,
  retryAgvTask
} from "@/api/integration";
import type { AgvTaskItem } from "@/api/integration";
import { deviceTaskStatusOptions, dictLabel, dictTag } from "@/constants/wms";
import RefreshRight from "~icons/ep/refresh-right";
import formComp from "../form.vue";

export function useAgvTask() {
  /** AGV 任务类型（枚举未入全局字典，按业务口径使用中文值） */
  const agvTaskTypeOptions = [
    { label: $t("integration.agv.typeCarry"), value: "搬运" },
    { label: $t("integration.agv.typeInbound"), value: "入库" },
    { label: $t("integration.agv.typeOutbound"), value: "出库" },
    { label: $t("integration.agv.typeCharge"), value: "充电" }
  ];

  const form = reactive({
    taskNo: "",
    agvCode: "",
    taskType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<AgvTaskItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("integration.agv.taskNo"),
      prop: "taskNo",
      minWidth: 140
    },
    { label: $t("integration.agv.code"), prop: "agvCode", minWidth: 90 },
    {
      label: $t("integration.agv.taskType"),
      prop: "taskType",
      minWidth: 70
    },
    {
      label: $t("integration.agv.fromLocation"),
      prop: "fromLocation",
      minWidth: 80
    },
    {
      label: $t("integration.agv.toLocation"),
      prop: "toLocation",
      minWidth: 80
    },
    {
      label: $t("integration.agv.priority"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag
          type={
            row.priority >= 4
              ? "danger"
              : row.priority >= 3
                ? "warning"
                : "info"
          }
        >
          {row.priority}
        </el-tag>
      )
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(deviceTaskStatusOptions, row.status)}>
          {dictLabel(deviceTaskStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("common.columns.createTime"),
      prop: "createdAt",
      minWidth: 140
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

  function operationButtons(row: AgvTaskItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "failed") {
      buttons.push({
        label: $t("integration.agv.retry"),
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
      const { data } = await getAgvTaskPage({
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

  /** 下发 AGV 任务弹窗（即新增） */
  function openDialog() {
    addDialog({
      title: $t("integration.agv.dispatchTitle"),
      width: "38%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          agvCode: "AGV-001",
          taskType: "搬运",
          fromLocation: "",
          toLocation: "",
          priority: 3
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<AgvTaskItem> }
        ).formInline;
        dispatchAgvTask(formInline).then(() => {
          message($t("integration.agv.dispatchSuccess"), { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 失败任务重新下发 */
  function handleRetry(row: AgvTaskItem) {
    ElMessageBox.confirm(
      $t("integration.agv.confirmRetry", { taskNo: row.taskNo }),
      $t("integration.agv.tipTitle"),
      {
        type: "warning"
      }
    ).then(() => {
      retryAgvTask(row.id).then(() => {
        message($t("integration.agv.retrySuccess"), { type: "success" });
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
    agvTaskTypeOptions,
    onSearch,
    resetForm,
    openDialog,
    handleRetry,
    handleSizeChange,
    handleCurrentChange
  };
}

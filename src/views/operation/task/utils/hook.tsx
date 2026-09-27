import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getTaskPage, assignTask, cancelTask } from "@/api/operation";
import type { TaskItem } from "@/api/operation";
import {
  taskTypeOptions,
  taskStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import User from "~icons/ep/user";
import CircleClose from "~icons/ep/circle-close";
import formComp from "../form.vue";

export function useTask() {
  const form = reactive({
    taskNo: "",
    taskType: "",
    status: "",
    keyword: ""
  });
  const loading = ref(false);
  const dataList = ref<TaskItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("operation.task.taskNo"), prop: "taskNo", minWidth: 130 },
    {
      label: $t("operation.task.taskType"),
      minWidth: 80,
      cellRenderer: ({ row }) => dictLabel(taskTypeOptions, row.taskType)
    },
    { label: $t("operation.task.bizNo"), prop: "bizNo", minWidth: 130 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    {
      label: $t("common.columns.location"),
      prop: "locationCode",
      minWidth: 80
    },
    {
      label: $t("operation.task.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("operation.task.materialName"),
      prop: "materialName",
      minWidth: 120
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 60 },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(taskStatusOptions, row.status)}>
          {dictLabel(taskStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: $t("operation.task.assignee"), prop: "assignee", minWidth: 80 },
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

  function operationButtons(row: TaskItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (["pending", "processing", "error"].includes(row.status)) {
      buttons.push({
        label: $t("common.buttons.assign"),
        icon: User,
        onClick: () => openAssignDialog(row)
      });
    }
    if (["pending", "error"].includes(row.status)) {
      buttons.push({
        label: $t("common.buttons.cancel"),
        type: "danger",
        icon: CircleClose,
        onClick: () => handleCancel(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getTaskPage({
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

  /** 分配任务 */
  function openAssignDialog(row: TaskItem) {
    addDialog({
      title: $t("operation.task.assignTitle"),
      width: "32%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row.id,
          taskNo: row.taskNo,
          assignee: row.assignee ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: { id: number; assignee: string } }
        ).formInline;
        assignTask(formInline.id, formInline.assignee).then(() => {
          message($t("operation.task.assignSuccess"), { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 取消任务 */
  function handleCancel(row: TaskItem) {
    ElMessageBox.confirm(
      $t("operation.task.cancelConfirm", { taskNo: row.taskNo }),
      $t("operation.task.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      cancelTask(row.id).then(() => {
        message($t("operation.task.cancelSuccess"), { type: "success" });
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
    openAssignDialog,
    handleCancel,
    handleSizeChange,
    handleCurrentChange
  };
}

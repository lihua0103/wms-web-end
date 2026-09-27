import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getProcessPage,
  addProcess,
  updateProcess,
  deleteProcess,
  startProcess,
  finishProcess
} from "@/api/operation";
import type { ProcessOrderItem } from "@/api/operation";
import { docStatusOptions, dictTag } from "@/constants/wms";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import VideoPlay from "~icons/ep/video-play";
import CircleCheck from "~icons/ep/circle-check";
import formComp from "../form.vue";

export function useProcess() {
  const statusMap: Record<string, string> = {
    pending: $t("operation.process.statusDraft"),
    processing: $t("operation.process.statusProcessing"),
    finished: $t("operation.process.statusFinished"),
    cancelled: $t("operation.process.statusCancelled")
  };

  const form = reactive({
    code: "",
    processType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ProcessOrderItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("operation.process.code"), prop: "code", minWidth: 130 },
    {
      label: $t("operation.process.processType"),
      prop: "processType",
      minWidth: 80
    },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    {
      label: $t("operation.process.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("operation.process.materialName"),
      prop: "materialName",
      minWidth: 120
    },
    { label: $t("operation.process.inputQty"), prop: "inputQty", minWidth: 80 },
    {
      label: $t("operation.process.outputQty"),
      prop: "outputQty",
      minWidth: 80
    },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(docStatusOptions, row.status)}>
          {statusMap[row.status] || row.status}
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

  function operationButtons(row: ProcessOrderItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "pending") {
      buttons.push({
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("operation.process.editOrder"), row)
      });
    }
    if (row.status === "pending") {
      buttons.push({
        label: $t("operation.process.start"),
        type: "warning",
        icon: VideoPlay,
        onClick: () => handleStart(row)
      });
    }
    if (row.status === "processing") {
      buttons.push({
        label: $t("operation.process.finish"),
        type: "success",
        icon: CircleCheck,
        onClick: () => handleFinish(row)
      });
    }
    if (row.status === "pending") {
      buttons.push({
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getProcessPage({
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

  /** 新增/编辑加工单 */
  function openDialog(title: string, row?: ProcessOrderItem) {
    addDialog({
      title,
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          processType: row?.processType ?? "贴标",
          warehouseCode: row?.warehouseCode ?? "WH001",
          materialCode: row?.materialCode ?? "",
          materialName: row?.materialName ?? "",
          inputQty: row?.inputQty ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<ProcessOrderItem> }
        ).formInline;
        const req = formInline.id
          ? updateProcess(formInline)
          : addProcess(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("operation.process.updateSuccess")
              : $t("operation.process.createSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  /** 开工 */
  function handleStart(row: ProcessOrderItem) {
    ElMessageBox.confirm(
      $t("operation.process.startConfirm", { code: row.code }),
      $t("operation.process.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      startProcess(row.id).then(() => {
        message($t("operation.process.startSuccess"), { type: "success" });
        onSearch();
      });
    });
  }

  /** 完工（录入产出数量） */
  function handleFinish(row: ProcessOrderItem) {
    addDialog({
      title: $t("operation.process.finishTitle"),
      width: "32%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row.id,
          processType: row.processType,
          warehouseCode: row.warehouseCode,
          materialCode: row.materialCode,
          materialName: row.materialName,
          inputQty: row.inputQty,
          outputQty: row.outputQty || row.inputQty,
          onlyOutput: true
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: { id: number; outputQty: number } }
        ).formInline;
        finishProcess(formInline.id, formInline.outputQty).then(() => {
          message($t("operation.process.finishSuccess"), { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: ProcessOrderItem) {
    ElMessageBox.confirm(
      $t("operation.process.deleteConfirm", { code: row.code }),
      $t("operation.process.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteProcess([row.id]).then(() => {
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
    statusMap,
    onSearch,
    resetForm,
    openDialog,
    handleStart,
    handleFinish,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

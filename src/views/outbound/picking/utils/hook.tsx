import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { $t } from "@/plugins/i18n";
import { message } from "@/utils/message";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getPickingPage, startPicking, finishPicking } from "@/api/outbound";
import type { PickingTaskItem } from "@/api/outbound";
import { taskStatusOptions, dictTag, dictLabel } from "@/constants/wms";
import VideoPlay from "~icons/ep/video-play";
import CircleCheck from "~icons/ep/circle-check";

export function usePicking() {
  const form = reactive({
    taskNo: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<PickingTaskItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("outbound.picking.taskNo"), prop: "taskNo", minWidth: 130 },
    { label: $t("outbound.picking.waveNo"), prop: "waveCode", minWidth: 130 },
    { label: $t("outbound.picking.orderNo"), prop: "orderCode", minWidth: 130 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    {
      label: $t("outbound.picking.pickLocation"),
      prop: "locationCode",
      minWidth: 90
    },
    {
      label: $t("outbound.picking.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("outbound.picking.materialName"),
      prop: "materialName",
      minWidth: 110
    },
    { label: $t("outbound.picking.pickQty"), prop: "pickQty", minWidth: 70 },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(taskStatusOptions, row.status)}>
          {dictLabel(taskStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: $t("outbound.picking.picker"), prop: "picker", minWidth: 70 },
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

  function operationButtons(row: PickingTaskItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "pending") {
      buttons.push({
        label: $t("outbound.picking.start"),
        icon: VideoPlay,
        onClick: () => handleStart(row)
      });
    }
    if (row.status === "processing") {
      buttons.push({
        label: $t("common.buttons.complete"),
        type: "success",
        icon: CircleCheck,
        onClick: () => handleFinish(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getPickingPage({
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

  function handleStart(row: PickingTaskItem) {
    ElMessageBox.confirm(
      $t("outbound.picking.startTip", { taskNo: row.taskNo }),
      $t("outbound.picking.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      startPicking(row.id).then(() => {
        message($t("outbound.picking.started"), { type: "success" });
        onSearch();
      });
    });
  }

  function handleFinish(row: PickingTaskItem) {
    ElMessageBox.confirm(
      $t("outbound.picking.finishTip", {
        taskNo: row.taskNo,
        material: row.materialName,
        qty: row.pickQty
      }),
      $t("outbound.picking.tip"),
      { type: "warning" }
    ).then(() => {
      finishPicking(row.id).then(() => {
        message($t("outbound.picking.finished"), { type: "success" });
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
    handleStart,
    handleFinish,
    handleSizeChange,
    handleCurrentChange
  };
}

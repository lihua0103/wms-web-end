import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { getPickingPage, startPicking, finishPicking } from "@/api/outbound";
import type { PickingTaskItem } from "@/api/outbound";
import { taskStatusOptions, dictTag, dictLabel } from "@/constants/wms";

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
    { label: "任务号", prop: "taskNo", minWidth: 130 },
    { label: "波次号", prop: "waveCode", minWidth: 130 },
    { label: "出库单号", prop: "orderCode", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "拣货库位", prop: "locationCode", minWidth: 90 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 110 },
    { label: "拣货数量", prop: "pickQty", minWidth: 70 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(taskStatusOptions, row.status)}>
          {dictLabel(taskStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "拣货员", prop: "picker", minWidth: 70 },
    { fixed: "right", label: "操作", width: 150, slot: "operation" }
  ];

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
    ElMessageBox.confirm(`确认开始拣货任务「${row.taskNo}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      startPicking(row.id).then(() => {
        message("拣货已开始", { type: "success" });
        onSearch();
      });
    });
  }

  function handleFinish(row: PickingTaskItem) {
    ElMessageBox.confirm(
      `确认任务「${row.taskNo}」拣货完成？（${row.materialName} × ${row.pickQty}）`,
      "提示",
      { type: "warning" }
    ).then(() => {
      finishPicking(row.id).then(() => {
        message("拣货完成", { type: "success" });
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

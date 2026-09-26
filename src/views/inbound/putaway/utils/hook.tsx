import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { getPutawayPage, finishPutaway } from "@/api/inbound";
import type { PutawayTaskItem } from "@/api/inbound";
import { taskStatusOptions, dictTag, dictLabel } from "@/constants/wms";

export function usePutaway() {
  const form = reactive({
    taskNo: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<PutawayTaskItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "任务号", prop: "taskNo", minWidth: 130 },
    { label: "收货单号", prop: "receiptCode", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "源库位", prop: "fromLocation", minWidth: 90 },
    { label: "目标库位", prop: "toLocation", minWidth: 90 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 120 },
    { label: "数量", prop: "qty", minWidth: 70 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(taskStatusOptions, row.status)}>
          {dictLabel(taskStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "操作员", prop: "operator", minWidth: 70 },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 100, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getPutawayPage({
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

  function handleFinish(row: PutawayTaskItem) {
    ElMessageBox.confirm(
      `确认任务「${row.taskNo}」已上架至 ${row.toLocation} 吗？`,
      "提示",
      { type: "warning" }
    ).then(() => {
      finishPutaway(row.id).then(() => {
        message("上架完成", { type: "success" });
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
    handleFinish,
    handleSizeChange,
    handleCurrentChange
  };
}

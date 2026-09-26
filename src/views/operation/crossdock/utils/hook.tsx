import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { getCrossdockPage, executeCrossdock } from "@/api/operation";
import type { CrossdockItem } from "@/api/operation";
import { docStatusOptions, dictTag } from "@/constants/wms";

const statusMap: Record<string, string> = {
  pending: "待执行",
  processing: "执行中",
  finished: "已完成",
  cancelled: "已取消"
};

export function useCrossdock() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<CrossdockItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "越库单号", prop: "code", minWidth: 130 },
    { label: "入库预约单", prop: "asnCode", minWidth: 130 },
    { label: "出库单", prop: "outboundCode", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 120 },
    { label: "数量", prop: "qty", minWidth: 70 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(docStatusOptions, row.status)}>
          {statusMap[row.status] || row.status}
        </el-tag>
      )
    },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 100, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getCrossdockPage({
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

  /** 执行越库 */
  function handleExecute(row: CrossdockItem) {
    ElMessageBox.confirm(
      `确认执行越库作业「${row.code}」？到货后不落上架，直接转入出库。`,
      "提示",
      { type: "warning" }
    ).then(() => {
      executeCrossdock(row.id).then(() => {
        message("越库执行完成", { type: "success" });
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
    handleExecute,
    handleSizeChange,
    handleCurrentChange
  };
}

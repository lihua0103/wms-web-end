import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { getShippingPage, confirmShipping } from "@/api/outbound";
import type { ShippingItem } from "@/api/outbound";

const statusMap: Record<string, { label: string; tag: string }> = {
  waiting: { label: "待发货", tag: "warning" },
  shipped: { label: "已发货", tag: "success" },
  finished: { label: "已完成", tag: "success" }
};

export function useShipping() {
  const form = reactive({
    code: "",
    carrierName: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ShippingItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "交接单号", prop: "code", minWidth: 130 },
    { label: "出库单号", prop: "orderCode", minWidth: 130 },
    { label: "承运商", prop: "carrierName", minWidth: 90 },
    { label: "车牌号", prop: "vehicleNo", minWidth: 90 },
    { label: "司机", prop: "driverName", minWidth: 70 },
    { label: "数量", prop: "qty", minWidth: 70 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={statusMap[row.status]?.tag || "info"}>
          {statusMap[row.status]?.label || row.status}
        </el-tag>
      )
    },
    { label: "发货日期", prop: "shipDate", minWidth: 90 },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 110, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getShippingPage({
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

  function handleConfirm(row: ShippingItem) {
    ElMessageBox.confirm(
      `确认交接单「${row.code}」已装车发货？（承运商：${row.carrierName}，车牌：${row.vehicleNo}）`,
      "提示",
      { type: "warning" }
    ).then(() => {
      confirmShipping(row.id).then(() => {
        message("发货确认成功", { type: "success" });
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
    handleConfirm,
    handleSizeChange,
    handleCurrentChange
  };
}

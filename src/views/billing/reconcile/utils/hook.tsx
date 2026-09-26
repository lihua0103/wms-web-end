import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { getReconcilePage, confirmReconcile, disputeReconcile } from "@/api/billing";
import type { ReconcileItem } from "@/api/billing";
import { billStatusOptions, dictLabel, dictTag } from "@/constants/wms";

/** 对账单状态：取账单状态字典的子集（待确认/已确认/异议中） */
const reconcileStatusOptions = billStatusOptions.filter(o =>
  ["pending", "confirmed", "disputed"].includes(String(o.value))
);

export function useBillingReconcile() {
  const form = reactive({
    code: "",
    ownerName: "",
    period: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ReconcileItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "对账单号", prop: "code", minWidth: 140 },
    { label: "货主", prop: "ownerName", minWidth: 110 },
    { label: "账期", prop: "period", minWidth: 80 },
    { label: "账单数", prop: "billCount", minWidth: 70 },
    {
      label: "总金额（元）",
      minWidth: 100,
      formatter: row =>
        Number(row.totalAmount).toLocaleString("zh-CN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
    },
    {
      label: "差异金额（元）",
      minWidth: 110,
      cellRenderer: ({ row }) => (
        <span style={Number(row.diffAmount) !== 0 ? "color:#f56c6c;font-weight:600" : ""}>
          {Number(row.diffAmount).toLocaleString("zh-CN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      )
    },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(reconcileStatusOptions, row.status)}>
          {dictLabel(reconcileStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 190, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getReconcilePage({
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

  /** 确认对账 / 提出异议 */
  function onAction(row: ReconcileItem, action: "confirm" | "dispute") {
    const map = {
      confirm: [confirmReconcile, "对账已确认", `确认对账单「${row.code}」吗？`],
      dispute: [disputeReconcile, "已提交异议", `确认对账单「${row.code}」提出异议吗？`]
    } as const;
    const [api, msg, tip] = map[action];
    ElMessageBox.confirm(tip as string, "提示", { type: "warning" }).then(() => {
      (api as (id: number) => Promise<any>)(row.id).then(() => {
        message(msg as string, { type: "success" });
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
    reconcileStatusOptions,
    onSearch,
    resetForm,
    onAction,
    handleSizeChange,
    handleCurrentChange
  };
}

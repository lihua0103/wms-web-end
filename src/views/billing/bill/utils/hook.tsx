import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { getBillPage, confirmBill, invoiceBill, settleBill } from "@/api/billing";
import type { FeeBillItem } from "@/api/billing";
import { feeTypeOptions, billStatusOptions, dictLabel, dictTag } from "@/constants/wms";

export function useBillingBill() {
  const form = reactive({
    code: "",
    ownerName: "",
    period: "",
    feeType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<FeeBillItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "账单编号", prop: "code", minWidth: 140 },
    { label: "货主", prop: "ownerName", minWidth: 110 },
    { label: "账期", prop: "period", minWidth: 80 },
    {
      label: "费用类型",
      minWidth: 80,
      cellRenderer: ({ row }) => dictLabel(feeTypeOptions, row.feeType)
    },
    { label: "数量", prop: "qty", minWidth: 70 },
    {
      label: "金额（元）",
      minWidth: 100,
      formatter: row =>
        Number(row.amount).toLocaleString("zh-CN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
    },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(billStatusOptions, row.status)}>
          {dictLabel(billStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "确认人", prop: "confirmUser", minWidth: 80, formatter: row => row.confirmUser || "-" },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 110, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getBillPage({
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

  /** 状态流转：确认 / 开票 / 结算 */
  function onAction(row: FeeBillItem, action: "confirm" | "invoice" | "settle") {
    const map = {
      confirm: [confirmBill, "账单已确认", `确认账单「${row.code}」吗？`],
      invoice: [invoiceBill, "开票成功", `确认为账单「${row.code}」开票吗？`],
      settle: [settleBill, "结算完成", `确认账单「${row.code}」已完成结算吗？`]
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
    onSearch,
    resetForm,
    onAction,
    handleSizeChange,
    handleCurrentChange
  };
}

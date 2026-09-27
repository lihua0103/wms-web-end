import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getBillPage,
  confirmBill,
  invoiceBill,
  settleBill
} from "@/api/billing";
import type { FeeBillItem } from "@/api/billing";
import {
  feeTypeOptions,
  billStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import { $t } from "@/plugins/i18n";

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
    { label: $t("billing.bill.no"), prop: "code", minWidth: 140 },
    { label: $t("common.columns.owner"), prop: "ownerName", minWidth: 110 },
    { label: $t("billing.bill.period"), prop: "period", minWidth: 80 },
    {
      label: $t("billing.bill.feeType"),
      minWidth: 80,
      cellRenderer: ({ row }) => dictLabel(feeTypeOptions, row.feeType)
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 70 },
    {
      label: $t("billing.bill.amountCol"),
      minWidth: 100,
      formatter: row =>
        Number(row.amount).toLocaleString("zh-CN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
    },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(billStatusOptions, row.status)}>
          {dictLabel(billStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("billing.bill.confirmUser"),
      prop: "confirmUser",
      minWidth: 80,
      formatter: row => row.confirmUser || "-"
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
        <ReTableOperation buttons={operationButtons(row)} emptyText={"-"} />
      )
    }
  ];

  function operationButtons(row: FeeBillItem): TableOperationButton[] {
    if (row.status === "pending") {
      return [
        {
          label: $t("billing.bill.confirmBtn"),
          onClick: () => onAction(row, "confirm")
        }
      ];
    }
    if (row.status === "confirmed") {
      return [
        {
          label: $t("billing.bill.invoiceBtn"),
          type: "warning",
          onClick: () => onAction(row, "invoice")
        }
      ];
    }
    if (row.status === "invoiced") {
      return [
        {
          label: $t("billing.bill.settleBtn"),
          type: "success",
          onClick: () => onAction(row, "settle")
        }
      ];
    }
    return [];
  }

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
  function onAction(
    row: FeeBillItem,
    action: "confirm" | "invoice" | "settle"
  ) {
    const map = {
      confirm: [
        confirmBill,
        $t("billing.bill.confirmSuccess"),
        $t("billing.bill.confirmTip", { code: row.code })
      ],
      invoice: [
        invoiceBill,
        $t("billing.bill.invoiceSuccess"),
        $t("billing.bill.invoiceTip", { code: row.code })
      ],
      settle: [
        settleBill,
        $t("billing.bill.settleSuccess"),
        $t("billing.bill.settleTip", { code: row.code })
      ]
    } as const;
    const [api, msg, tip] = map[action];
    ElMessageBox.confirm(tip as string, $t("billing.bill.tip"), {
      type: "warning"
    }).then(() => {
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

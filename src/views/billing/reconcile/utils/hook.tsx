import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getReconcilePage,
  confirmReconcile,
  disputeReconcile
} from "@/api/billing";
import type { ReconcileItem } from "@/api/billing";
import { billStatusOptions, dictLabel, dictTag } from "@/constants/wms";
import { $t } from "@/plugins/i18n";

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
    { label: $t("billing.reconcile.no"), prop: "code", minWidth: 140 },
    { label: $t("common.columns.owner"), prop: "ownerName", minWidth: 110 },
    { label: $t("billing.reconcile.period"), prop: "period", minWidth: 80 },
    {
      label: $t("billing.reconcile.billCount"),
      prop: "billCount",
      minWidth: 70
    },
    {
      label: $t("billing.reconcile.totalAmountCol"),
      minWidth: 100,
      formatter: row =>
        Number(row.totalAmount).toLocaleString("zh-CN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
    },
    {
      label: $t("billing.reconcile.diffAmountCol"),
      minWidth: 110,
      cellRenderer: ({ row }) => (
        <span
          style={
            Number(row.diffAmount) !== 0 ? "color:#f56c6c;font-weight:600" : ""
          }
        >
          {Number(row.diffAmount).toLocaleString("zh-CN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      )
    },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(reconcileStatusOptions, row.status)}>
          {dictLabel(reconcileStatusOptions, row.status)}
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
        <ReTableOperation buttons={operationButtons(row)} emptyText={"-"} />
      )
    }
  ];

  function operationButtons(row: ReconcileItem): TableOperationButton[] {
    if (row.status !== "pending") return [];
    return [
      {
        label: $t("billing.reconcile.confirmBtn"),
        onClick: () => onAction(row, "confirm")
      },
      {
        label: $t("billing.reconcile.disputeBtn"),
        type: "danger",
        onClick: () => onAction(row, "dispute")
      }
    ];
  }

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
      confirm: [
        confirmReconcile,
        $t("billing.reconcile.confirmSuccess"),
        $t("billing.reconcile.confirmTip", { code: row.code })
      ],
      dispute: [
        disputeReconcile,
        $t("billing.reconcile.disputeSuccess"),
        $t("billing.reconcile.disputeTip", { code: row.code })
      ]
    } as const;
    const [api, msg, tip] = map[action];
    ElMessageBox.confirm(tip as string, $t("billing.reconcile.tip"), {
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
    reconcileStatusOptions,
    onSearch,
    resetForm,
    onAction,
    handleSizeChange,
    handleCurrentChange
  };
}

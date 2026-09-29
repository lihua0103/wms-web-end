import { reactive, ref, onMounted } from "vue";
import { getTransactionPage } from "@/api/inventory";
import type { TransactionItem } from "@/api/inventory";
import { transactionTypeOptions, dictLabel, dictTag } from "@/constants/wms";
import { $t } from "@/plugins/i18n";

export function useTransaction() {
  const form = reactive({
    transactionNo: "",
    transactionType: "",
    materialCode: "",
    materialName: "",
    warehouseCode: "",
    bizNo: ""
  });
  const loading = ref(false);
  const dataList = ref<TransactionItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("inventory.transaction.transactionNo"),
      prop: "transactionNo",
      minWidth: 130
    },
    {
      label: $t("inventory.transaction.transactionType"),
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(transactionTypeOptions, row.transactionType)}>
          {dictLabel(transactionTypeOptions, row.transactionType)}
        </el-tag>
      )
    },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 100
    },
    {
      label: $t("common.columns.location"),
      prop: "locationCode",
      minWidth: 90
    },
    {
      label: $t("inventory.transaction.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inventory.transaction.materialName"),
      prop: "materialName",
      minWidth: 130
    },
    {
      label: $t("common.columns.batchNo"),
      prop: "batchNo",
      minWidth: 90
    },
    {
      label: $t("inventory.transaction.qtyChange"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <span
          style={
            row.qtyChange > 0
              ? "color:#67c23a;font-weight:600"
              : "color:#f56c6c;font-weight:600"
          }
        >
          {row.qtyChange > 0 ? `+${row.qtyChange}` : row.qtyChange}
        </span>
      )
    },
    {
      label: $t("inventory.transaction.balanceQty"),
      prop: "balanceQty",
      minWidth: 90
    },
    {
      label: $t("inventory.transaction.bizNo"),
      prop: "bizNo",
      minWidth: 120
    },
    {
      label: $t("inventory.transaction.operator"),
      prop: "operator",
      minWidth: 90
    },
    {
      label: $t("common.columns.createTime"),
      prop: "createdAt",
      minWidth: 150
    }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getTransactionPage({
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

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    transactionTypeOptions,
    onSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange
  };
}

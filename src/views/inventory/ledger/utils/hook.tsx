import { reactive, ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { getLedgerPage, freezeStock } from "@/api/inventory";
import type { LedgerItem } from "@/api/inventory";
import { stockStatusOptions, dictLabel, dictTag } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import Lock from "~icons/ep/lock";
import Unlock from "~icons/ep/unlock";

export function useLedger() {
  const form = reactive({
    warehouseCode: "",
    locationCode: "",
    materialCode: "",
    materialName: "",
    batchNo: "",
    stockStatus: ""
  });
  const loading = ref(false);
  const dataList = ref<LedgerItem[]>([]);
  const detailVisible = ref(false);
  const currentRow = ref<LedgerItem>();

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseName",
      minWidth: 100
    },
    {
      label: $t("common.columns.location"),
      prop: "locationCode",
      minWidth: 80
    },
    {
      label: $t("inventory.ledger.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inventory.ledger.materialName"),
      prop: "materialName",
      minWidth: 130
    },
    { label: $t("inventory.ledger.batch"), prop: "batchNo", minWidth: 90 },
    {
      label: $t("inventory.ledger.stockStatus"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(stockStatusOptions, row.stockStatus)}>
          {dictLabel(stockStatusOptions, row.stockStatus)}
        </el-tag>
      )
    },
    { label: $t("inventory.ledger.qty"), prop: "qty", minWidth: 80 },
    { label: $t("inventory.ledger.locked"), prop: "lockedQty", minWidth: 70 },
    {
      label: $t("inventory.ledger.available"),
      prop: "availableQty",
      minWidth: 80
    },
    { label: $t("common.columns.owner"), prop: "ownerName", minWidth: 110 },
    {
      label: $t("inventory.ledger.expiredAt"),
      prop: "expiredAt",
      minWidth: 90
    },
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

  function operationButtons(row: LedgerItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.detail"),
        onClick: () => openDetail(row)
      }
    ];
    if (row.stockStatus !== "frozen") {
      buttons.push({
        label: $t("inventory.ledger.freeze"),
        type: "warning",
        icon: Lock,
        onClick: () => handleFreeze(row, true)
      });
    } else {
      buttons.push({
        label: $t("inventory.ledger.unfreeze"),
        type: "success",
        icon: Unlock,
        onClick: () => handleFreeze(row, false)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getLedgerPage({
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

  function openDetail(row: LedgerItem) {
    currentRow.value = row;
    detailVisible.value = true;
  }

  function handleFreeze(row: LedgerItem, freeze: boolean) {
    freezeStock([row.id], freeze).then(() => {
      message(
        freeze
          ? $t("inventory.ledger.freezeSuccess")
          : $t("inventory.ledger.unfreezeSuccess"),
        { type: "success" }
      );
      onSearch();
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
    detailVisible,
    currentRow,
    onSearch,
    resetForm,
    openDetail,
    handleFreeze,
    handleSizeChange,
    handleCurrentChange
  };
}

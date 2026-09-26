import { reactive, ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { getLedgerPage, freezeStock } from "@/api/inventory";
import type { LedgerItem } from "@/api/inventory";
import { stockStatusOptions, dictLabel, dictTag } from "@/constants/wms";

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
    { label: "仓库", prop: "warehouseName", minWidth: 100 },
    { label: "库位", prop: "locationCode", minWidth: 80 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 130 },
    { label: "批次", prop: "batchNo", minWidth: 90 },
    {
      label: "库存状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(stockStatusOptions, row.stockStatus)}>
          {dictLabel(stockStatusOptions, row.stockStatus)}
        </el-tag>
      )
    },
    { label: "库存量", prop: "qty", minWidth: 80 },
    { label: "锁定", prop: "lockedQty", minWidth: 70 },
    { label: "可用量", prop: "availableQty", minWidth: 80 },
    { label: "货主", prop: "ownerName", minWidth: 110 },
    { label: "失效日期", prop: "expiredAt", minWidth: 90 },
    { fixed: "right", label: "操作", width: 150, slot: "operation" }
  ];

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
      message(freeze ? "冻结成功" : "解冻成功", { type: "success" });
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

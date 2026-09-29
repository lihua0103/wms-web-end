import { reactive, ref, onMounted } from "vue";
import { getBatchPage } from "@/api/inventory";
import type { BatchItem } from "@/api/inventory";
import { batchStatusOptions, dictLabel, dictTag } from "@/constants/wms";
import { $t } from "@/plugins/i18n";

export function useBatch() {
  const form = reactive({
    materialCode: "",
    materialName: "",
    batchNo: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<BatchItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("inventory.batch.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inventory.batch.materialName"),
      prop: "materialName",
      minWidth: 140
    },
    {
      label: $t("common.columns.batchNo"),
      prop: "batchNo",
      minWidth: 90
    },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 100
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 90 },
    {
      label: $t("inventory.batch.productionDate"),
      prop: "productionDate",
      minWidth: 100
    },
    {
      label: $t("inventory.batch.expiredAt"),
      prop: "expiredAt",
      minWidth: 100
    },
    {
      label: $t("inventory.batch.remainDays"),
      minWidth: 110,
      cellRenderer: ({ row }) => (
        <span
          style={
            row.remainDays < 0
              ? "color:#f56c6c;font-weight:600"
              : row.remainDays < 30
                ? "color:#e6a23c;font-weight:600"
                : ""
          }
        >
          {row.remainDays}
        </span>
      )
    },
    {
      label: $t("common.columns.status"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(batchStatusOptions, row.status)}>
          {dictLabel(batchStatusOptions, row.status)}
        </el-tag>
      )
    }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getBatchPage({
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
    batchStatusOptions,
    onSearch,
    resetForm,
    handleSizeChange,
    handleCurrentChange
  };
}

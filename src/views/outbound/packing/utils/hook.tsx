import { reactive, ref, onMounted } from "vue";
import { $t } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { message } from "@/utils/message";
import { getPackingPage, checkPacking } from "@/api/outbound";
import type { PackingItem } from "@/api/outbound";
import EditPen from "~icons/ep/edit-pen";
import formComp from "../form.vue";

export function usePacking() {
  const statusMap: Record<string, { label: string; tag: string }> = {
    waiting: { label: $t("outbound.packing.statusWaiting"), tag: "warning" },
    processing: {
      label: $t("outbound.packing.statusProcessing"),
      tag: "primary"
    },
    finished: { label: $t("outbound.packing.statusFinished"), tag: "success" }
  };

  const form = reactive({
    code: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<PackingItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("outbound.packing.code"), prop: "code", minWidth: 130 },
    { label: $t("outbound.packing.orderNo"), prop: "orderCode", minWidth: 130 },
    { label: $t("outbound.packing.waveNo"), prop: "waveCode", minWidth: 130 },
    {
      label: $t("outbound.packing.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("outbound.packing.materialName"),
      prop: "materialName",
      minWidth: 110
    },
    { label: $t("outbound.packing.expected"), prop: "qty", minWidth: 70 },
    { label: $t("outbound.packing.checked"), prop: "checkedQty", minWidth: 70 },
    { label: $t("outbound.packing.weight"), prop: "weight", minWidth: 80 },
    { label: $t("outbound.packing.boxNo"), prop: "boxNo", minWidth: 100 },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={statusMap[row.status]?.tag || "info"}>
          {statusMap[row.status]?.label || row.status}
        </el-tag>
      )
    },
    { label: $t("outbound.packing.operator"), prop: "operator", minWidth: 70 },
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

  function operationButtons(row: PackingItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status !== "finished") {
      buttons.push({
        label: $t("outbound.packing.review"),
        icon: EditPen,
        onClick: () => openCheckDialog(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getPackingPage({
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

  /** 复核打包 */
  function openCheckDialog(row: PackingItem) {
    addDialog({
      title: $t("outbound.packing.title"),
      width: "34%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row.id,
          code: row.code,
          qty: row.qty,
          checkedQty: row.checkedQty || row.qty,
          weight: row.weight
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as {
            formInline: { id: number; checkedQty: number; weight?: number };
          }
        ).formInline;
        checkPacking(formInline).then(() => {
          message($t("outbound.packing.reviewed"), { type: "success" });
          done();
          onSearch();
        });
      }
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
    openCheckDialog,
    handleSizeChange,
    handleCurrentChange
  };
}

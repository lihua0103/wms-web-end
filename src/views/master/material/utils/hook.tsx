import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { $t } from "@/plugins/i18n";
import {
  getMaterialPage,
  addMaterial,
  updateMaterial,
  deleteMaterial
} from "@/api/master";
import type { MaterialItem } from "@/api/master";
import { materialCategoryOptions, dictLabel } from "@/constants/wms";
import View from "~icons/ep/view";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

export function useMaterial() {
  const form = reactive({
    code: "",
    name: "",
    category: "",
    isSerial: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<MaterialItem[]>([]);
  const detailVisible = ref(false);
  const currentRow = ref<MaterialItem>();

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("master.material.code"), prop: "code", minWidth: 100 },
    { label: $t("master.material.name"), prop: "name", minWidth: 130 },
    {
      label: $t("master.material.category"),
      minWidth: 80,
      cellRenderer: ({ row }) =>
        dictLabel(materialCategoryOptions, row.category)
    },
    { label: $t("master.material.spec"), prop: "spec", minWidth: 80 },
    { label: $t("common.columns.unit"), prop: "unit", minWidth: 60 },
    { label: $t("master.material.barcode"), prop: "barcode", minWidth: 120 },
    { label: $t("common.columns.owner"), prop: "ownerName", minWidth: 110 },
    {
      label: $t("master.material.expiryMgmt"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.isExpiry ? "success" : "info"}>
          {row.isExpiry ? $t("master.material.yes") : $t("master.material.no")}
        </el-tag>
      )
    },
    {
      label: $t("master.material.serialMgmt"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={row.isSerial ? "warning" : "info"}>
          {row.isSerial ? $t("master.material.yes") : $t("master.material.no")}
        </el-tag>
      )
    },
    { label: $t("master.material.safetyQty"), prop: "safetyQty", minWidth: 70 },
    {
      label: $t("common.columns.status"),
      minWidth: 60,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1
            ? $t("master.material.enabled")
            : $t("master.material.disabled")}
        </el-tag>
      )
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

  function operationButtons(row: MaterialItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.detail"),
        icon: View,
        onClick: () => openDetail(row)
      },
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("master.material.editTitle"), row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      }
    ];
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getMaterialPage({
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

  function openDetail(row: MaterialItem) {
    currentRow.value = row;
    detailVisible.value = true;
  }

  function openDialog(title: string, row?: MaterialItem) {
    addDialog({
      title,
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          code: row?.code ?? "",
          name: row?.name ?? "",
          category: row?.category ?? "finished",
          spec: row?.spec ?? "",
          unit: row?.unit ?? $t("master.material.unitPiece"),
          barcode: row?.barcode ?? "",
          ownerName: row?.ownerName ?? "",
          isExpiry: row?.isExpiry ?? 0,
          isSerial: row?.isSerial ?? 0,
          safetyQty: row?.safetyQty ?? 0,
          price: row?.price ?? 0,
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<MaterialItem> }
        ).formInline;
        const req = formInline.id
          ? updateMaterial(formInline)
          : addMaterial(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("master.material.editSuccess")
              : $t("master.material.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: MaterialItem) {
    ElMessageBox.confirm(
      $t("master.material.delTip", { name: row.name }),
      $t("master.material.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteMaterial([row.id]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
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
    detailVisible,
    currentRow,
    materialCategoryOptions,
    onSearch,
    resetForm,
    openDetail,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

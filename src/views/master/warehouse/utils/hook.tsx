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
  getWarehousePage,
  addWarehouse,
  updateWarehouse,
  deleteWarehouse
} from "@/api/master";
import type { WarehouseItem } from "@/api/master";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

export function useWarehouse() {
  const form = reactive({
    code: "",
    name: "",
    type: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<WarehouseItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("master.warehouse.code"), prop: "code", minWidth: 90 },
    { label: $t("master.warehouse.name"), prop: "name", minWidth: 100 },
    {
      label: $t("common.columns.type"),
      minWidth: 70,
      cellRenderer: ({ row }) =>
        ({
          normal: $t("master.warehouse.typeNormal"),
          cold: $t("master.warehouse.typeCold"),
          dangerous: $t("master.warehouse.typeDangerous")
        })[row.type] || row.type
    },
    { label: $t("master.warehouse.address"), prop: "address", minWidth: 140 },
    { label: $t("master.warehouse.contact"), prop: "contact", minWidth: 70 },
    { label: $t("master.warehouse.phone"), prop: "phone", minWidth: 100 },
    {
      label: $t("master.warehouse.colArea"),
      minWidth: 100,
      formatter: row => `${row.areaUsed || 0} / ${row.area || 0}`
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1
            ? $t("master.warehouse.enabled")
            : $t("master.warehouse.disabled")}
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

  function operationButtons(row: WarehouseItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("master.warehouse.editTitle"), row)
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
      const { data } = await getWarehousePage({
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

  function openDialog(title: string, row?: WarehouseItem) {
    addDialog({
      title,
      width: "42%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          code: row?.code ?? "",
          name: row?.name ?? "",
          address: row?.address ?? "",
          contact: row?.contact ?? "",
          phone: row?.phone ?? "",
          type: row?.type ?? "normal",
          area: row?.area,
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<WarehouseItem> }
        ).formInline;
        const req = formInline.id
          ? updateWarehouse(formInline)
          : addWarehouse(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("master.warehouse.editSuccess")
              : $t("master.warehouse.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: WarehouseItem) {
    ElMessageBox.confirm(
      $t("master.warehouse.delTip", { name: row.name }),
      $t("master.warehouse.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteWarehouse([row.id]).then(() => {
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
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

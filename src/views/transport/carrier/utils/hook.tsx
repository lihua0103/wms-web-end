import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getCarrierPage,
  addCarrier,
  updateCarrier,
  deleteCarrier
} from "@/api/transport";
import type { CarrierItem } from "@/api/transport";
import { carrierTypeOptions, dictLabel, dictTag } from "@/constants/wms";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

export function useCarrier() {
  const form = reactive({
    code: "",
    name: "",
    carrierType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<CarrierItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("common.columns.code"), prop: "code", minWidth: 90 },
    { label: $t("transport.carrier.name"), prop: "name", minWidth: 120 },
    {
      label: $t("common.columns.type"),
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(carrierTypeOptions, row.carrierType)
    },
    { label: $t("transport.carrier.contact"), prop: "contact", minWidth: 80 },
    { label: $t("transport.carrier.phone"), prop: "phone", minWidth: 110 },
    {
      label: $t("transport.carrier.serviceArea"),
      prop: "serviceArea",
      minWidth: 100
    },
    {
      label: $t("transport.carrier.settleType"),
      prop: "settleType",
      minWidth: 80
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1
            ? $t("common.buttons.enabled")
            : $t("common.buttons.disabled")}
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

  function operationButtons(row: CarrierItem): TableOperationButton[] {
    return [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("transport.carrier.edit"), row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      }
    ];
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getCarrierPage({
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

  function openDialog(title: string, row?: CarrierItem) {
    addDialog({
      title,
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          code: row?.code ?? "",
          name: row?.name ?? "",
          carrierType: row?.carrierType ?? "third",
          contact: row?.contact ?? "",
          phone: row?.phone ?? "",
          serviceArea: row?.serviceArea ?? "",
          settleType: row?.settleType ?? "月结",
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<CarrierItem> }
        ).formInline;
        const req = formInline.id
          ? updateCarrier(formInline)
          : addCarrier(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("transport.carrier.updateSuccess")
              : $t("transport.carrier.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: CarrierItem) {
    ElMessageBox.confirm(
      $t("transport.carrier.confirmDelete", { name: row.name }),
      $t("transport.carrier.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteCarrier([row.id]).then(() => {
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
    dictLabel,
    dictTag,
    carrierTypeOptions,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

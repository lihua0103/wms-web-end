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
  getVehiclePage,
  addVehicle,
  updateVehicle,
  deleteVehicle
} from "@/api/transport";
import type { VehicleItem } from "@/api/transport";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

const statusTag: Record<string, string> = {
  空闲: "success",
  在途: "primary",
  维修: "danger"
};

export function useVehicle() {
  const form = reactive({
    vehicleNo: "",
    driverName: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<VehicleItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("transport.vehicle.licensePlate"),
      prop: "vehicleNo",
      minWidth: 100
    },
    { label: $t("transport.vehicle.driver"), prop: "driverName", minWidth: 90 },
    { label: $t("transport.vehicle.phone"), prop: "phone", minWidth: 110 },
    {
      label: $t("transport.vehicle.vehicleType"),
      prop: "vehicleType",
      minWidth: 70
    },
    {
      label: $t("transport.vehicle.loadTon"),
      prop: "maxLoad",
      minWidth: 80,
      formatter: row =>
        row.maxLoad ? `${row.maxLoad} ${$t("transport.vehicle.ton")}` : "-"
    },
    {
      label: $t("transport.vehicle.carrier"),
      prop: "carrierName",
      minWidth: 100
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={statusTag[row.status] || "info"}>{row.status}</el-tag>
      )
    },
    { label: $t("common.columns.remark"), prop: "remark", minWidth: 100 },
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

  function operationButtons(row: VehicleItem): TableOperationButton[] {
    return [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("transport.vehicle.edit"), row)
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
      const { data } = await getVehiclePage({
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

  function openDialog(title: string, row?: VehicleItem) {
    addDialog({
      title,
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          vehicleNo: row?.vehicleNo ?? "",
          driverName: row?.driverName ?? "",
          phone: row?.phone ?? "",
          vehicleType: row?.vehicleType ?? "厢式",
          maxLoad: row?.maxLoad ?? 5,
          carrierName: row?.carrierName ?? "",
          status: row?.status ?? "空闲",
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<VehicleItem> }
        ).formInline;
        const req = formInline.id
          ? updateVehicle(formInline)
          : addVehicle(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("transport.vehicle.updateSuccess")
              : $t("transport.vehicle.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: VehicleItem) {
    ElMessageBox.confirm(
      $t("transport.vehicle.confirmDelete", { vehicleNo: row.vehicleNo }),
      $t("transport.vehicle.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteVehicle([row.id]).then(() => {
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

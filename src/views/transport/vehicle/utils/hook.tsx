import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getVehiclePage,
  addVehicle,
  updateVehicle,
  deleteVehicle
} from "@/api/transport";
import type { VehicleItem } from "@/api/transport";
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
    { label: "车牌号", prop: "vehicleNo", minWidth: 100 },
    { label: "司机", prop: "driverName", minWidth: 90 },
    { label: "电话", prop: "phone", minWidth: 110 },
    { label: "车型", prop: "vehicleType", minWidth: 70 },
    {
      label: "载重(吨)",
      prop: "maxLoad",
      minWidth: 80,
      formatter: row => (row.maxLoad ? `${row.maxLoad} 吨` : "-")
    },
    { label: "所属承运商", prop: "carrierName", minWidth: 100 },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={statusTag[row.status] || "info"}>{row.status}</el-tag>
      )
    },
    { label: "备注", prop: "remark", minWidth: 100 },
    { fixed: "right", label: "操作", width: 140, slot: "operation" }
  ];

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
        const req = formInline.id ? updateVehicle(formInline) : addVehicle(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: VehicleItem) {
    ElMessageBox.confirm(`确认删除车辆「${row.vehicleNo}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteVehicle([row.id]).then(() => {
        message("删除成功", { type: "success" });
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

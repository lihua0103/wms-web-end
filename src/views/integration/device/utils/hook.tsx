import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getDevicePage,
  addDevice,
  updateDevice,
  deleteDevice,
  toggleDevice
} from "@/api/integration";
import type { DeviceItem } from "@/api/integration";
import {
  deviceTypeOptions,
  deviceStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import formComp from "../form.vue";

export function useDevice() {
  const form = reactive({
    code: "",
    name: "",
    deviceType: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<DeviceItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "设备编码", prop: "code", minWidth: 90 },
    { label: "设备名称", prop: "name", minWidth: 130 },
    {
      label: "设备类型",
      minWidth: 100,
      cellRenderer: ({ row }) => dictLabel(deviceTypeOptions, row.deviceType)
    },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "库区", prop: "zoneCode", minWidth: 60 },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(deviceStatusOptions, row.status)}>
          {dictLabel(deviceStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "最后心跳", prop: "lastHeartbeat", minWidth: 140 },
    { label: "IP 地址", prop: "ip", minWidth: 100 },
    { label: "厂商", prop: "vendor", minWidth: 90 },
    { fixed: "right", label: "操作", width: 210, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getDevicePage({
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

  /** 新增/编辑设备弹窗 */
  function openDialog(title: string, row?: DeviceItem) {
    addDialog({
      title,
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          code: row?.code ?? "",
          name: row?.name ?? "",
          deviceType: row?.deviceType ?? "",
          warehouseCode: row?.warehouseCode ?? "WH001",
          zoneCode: row?.zoneCode ?? "",
          ip: row?.ip ?? "",
          vendor: row?.vendor ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<DeviceItem> }
        ).formInline;
        const req = formInline.id
          ? updateDevice(formInline)
          : addDevice(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 启用/停用设备 */
  function handleToggle(row: DeviceItem) {
    const enable = row.status === "offline";
    ElMessageBox.confirm(
      `确认${enable ? "启用" : "停用"}设备「${row.name}」吗？`,
      "提示",
      { type: "warning" }
    ).then(() => {
      toggleDevice(row.id, enable).then(() => {
        message(enable ? "设备已启用" : "设备已停用", { type: "success" });
        onSearch();
      });
    });
  }

  function handleDelete(row: DeviceItem) {
    ElMessageBox.confirm(`确认删除设备「${row.name}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteDevice([row.id]).then(() => {
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
    handleToggle,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

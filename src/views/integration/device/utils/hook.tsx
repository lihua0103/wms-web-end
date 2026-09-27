import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { $t } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
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
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import SwitchBtn from "~icons/ep/switch-button";
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
    { label: $t("integration.device.code"), prop: "code", minWidth: 90 },
    { label: $t("integration.device.name"), prop: "name", minWidth: 130 },
    {
      label: $t("integration.device.type"),
      minWidth: 100,
      cellRenderer: ({ row }) => dictLabel(deviceTypeOptions, row.deviceType)
    },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    { label: $t("common.columns.zone"), prop: "zoneCode", minWidth: 60 },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(deviceStatusOptions, row.status)}>
          {dictLabel(deviceStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("integration.device.lastHeartbeat"),
      prop: "lastHeartbeat",
      minWidth: 140
    },
    { label: $t("integration.device.ip"), prop: "ip", minWidth: 100 },
    { label: $t("integration.device.vendor"), prop: "vendor", minWidth: 90 },
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

  function operationButtons(row: DeviceItem): TableOperationButton[] {
    return [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("integration.device.editTitle"), row)
      },
      {
        label:
          row.status === "offline"
            ? $t("common.buttons.enabled")
            : $t("common.buttons.disabled"),
        type: row.status === "offline" ? "success" : "warning",
        icon: SwitchBtn,
        onClick: () => handleToggle(row)
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
          message(
            formInline.id
              ? $t("integration.device.editSuccess")
              : $t("integration.device.addSuccess"),
            { type: "success" }
          );
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
      enable
        ? $t("integration.device.confirmEnable", { name: row.name })
        : $t("integration.device.confirmDisable", { name: row.name }),
      $t("integration.device.tipTitle"),
      { type: "warning" }
    ).then(() => {
      toggleDevice(row.id, enable).then(() => {
        message(
          enable
            ? $t("integration.device.enabledSuccess")
            : $t("integration.device.disabledSuccess"),
          { type: "success" }
        );
        onSearch();
      });
    });
  }

  function handleDelete(row: DeviceItem) {
    ElMessageBox.confirm(
      $t("integration.device.confirmDelete", { name: row.name }),
      $t("integration.device.tipTitle"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteDevice([row.id]).then(() => {
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
    handleToggle,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

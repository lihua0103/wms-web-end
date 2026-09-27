import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getDeviceTaskPage, cancelDeviceTask } from "@/api/integration";
import type { DeviceTaskItem } from "@/api/integration";
import {
  deviceTypeOptions,
  deviceTaskStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import CircleClose from "~icons/ep/circle-close";

export function useDeviceTask() {
  const form = reactive({
    taskNo: "",
    deviceCode: "",
    bizNo: "",
    deviceType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<DeviceTaskItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("integration.deviceTask.taskNo"),
      prop: "taskNo",
      minWidth: 130
    },
    {
      label: $t("integration.device.code"),
      prop: "deviceCode",
      minWidth: 90
    },
    {
      label: $t("integration.device.type"),
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(deviceTypeOptions, row.deviceType)
    },
    {
      label: $t("integration.deviceTask.bizNo"),
      prop: "bizNo",
      minWidth: 130
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 60 },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(deviceTaskStatusOptions, row.status)}>
          {dictLabel(deviceTaskStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("common.columns.createTime"),
      prop: "createdAt",
      minWidth: 140
    },
    {
      label: $t("integration.deviceTask.finishTime"),
      prop: "finishedAt",
      minWidth: 140
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

  function operationButtons(row: DeviceTaskItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (["queued", "executing"].includes(row.status)) {
      buttons.push({
        label: $t("common.buttons.cancel"),
        type: "danger",
        icon: CircleClose,
        onClick: () => handleCancel(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getDeviceTaskPage({
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

  /** 取消排队/执行中的设备任务 */
  function handleCancel(row: DeviceTaskItem) {
    ElMessageBox.confirm(
      $t("integration.deviceTask.confirmCancel", { taskNo: row.taskNo }),
      $t("integration.deviceTask.tipTitle"),
      {
        type: "warning"
      }
    ).then(() => {
      cancelDeviceTask(row.id).then(() => {
        message($t("integration.deviceTask.cancelSuccess"), {
          type: "success"
        });
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
    handleCancel,
    handleSizeChange,
    handleCurrentChange
  };
}

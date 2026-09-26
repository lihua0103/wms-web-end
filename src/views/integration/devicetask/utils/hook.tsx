import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { getDeviceTaskPage, cancelDeviceTask } from "@/api/integration";
import type { DeviceTaskItem } from "@/api/integration";
import {
  deviceTypeOptions,
  deviceTaskStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";

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
    { label: "任务号", prop: "taskNo", minWidth: 130 },
    { label: "设备编码", prop: "deviceCode", minWidth: 90 },
    {
      label: "设备类型",
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(deviceTypeOptions, row.deviceType)
    },
    { label: "业务单号", prop: "bizNo", minWidth: 130 },
    { label: "数量", prop: "qty", minWidth: 60 },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(deviceTaskStatusOptions, row.status)}>
          {dictLabel(deviceTaskStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { label: "完成时间", prop: "finishedAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 100, slot: "operation" }
  ];

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
    ElMessageBox.confirm(`确认取消任务「${row.taskNo}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      cancelDeviceTask(row.id).then(() => {
        message("任务已取消", { type: "success" });
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

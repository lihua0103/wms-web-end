import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getAgvTaskPage,
  dispatchAgvTask,
  retryAgvTask
} from "@/api/integration";
import type { AgvTaskItem } from "@/api/integration";
import { deviceTaskStatusOptions, dictLabel, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

/** AGV 任务类型（枚举未入全局字典，按业务口径使用中文值） */
export const agvTaskTypeOptions = [
  { label: "搬运", value: "搬运" },
  { label: "入库", value: "入库" },
  { label: "出库", value: "出库" },
  { label: "充电", value: "充电" }
];

export function useAgvTask() {
  const form = reactive({
    taskNo: "",
    agvCode: "",
    taskType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<AgvTaskItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "任务号", prop: "taskNo", minWidth: 140 },
    { label: "AGV 编号", prop: "agvCode", minWidth: 90 },
    { label: "任务类型", prop: "taskType", minWidth: 70 },
    { label: "起始库位", prop: "fromLocation", minWidth: 80 },
    { label: "目标库位", prop: "toLocation", minWidth: 80 },
    {
      label: "优先级",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag
          type={
            row.priority >= 4
              ? "danger"
              : row.priority >= 3
                ? "warning"
                : "info"
          }
        >
          {row.priority}
        </el-tag>
      )
    },
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
    { fixed: "right", label: "操作", width: 120, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getAgvTaskPage({
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

  /** 下发 AGV 任务弹窗（即新增） */
  function openDialog() {
    addDialog({
      title: "下发 AGV 任务",
      width: "38%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          agvCode: "AGV-001",
          taskType: "搬运",
          fromLocation: "",
          toLocation: "",
          priority: 3
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<AgvTaskItem> }
        ).formInline;
        dispatchAgvTask(formInline).then(() => {
          message("任务已下发", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 失败任务重新下发 */
  function handleRetry(row: AgvTaskItem) {
    ElMessageBox.confirm(`确认重新下发任务「${row.taskNo}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      retryAgvTask(row.id).then(() => {
        message("已重新下发", { type: "success" });
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
    handleRetry,
    handleSizeChange,
    handleCurrentChange
  };
}

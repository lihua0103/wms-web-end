import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getTaskPage, assignTask, cancelTask } from "@/api/operation";
import type { TaskItem } from "@/api/operation";
import { taskTypeOptions, taskStatusOptions, dictLabel, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

export function useTask() {
  const form = reactive({
    taskNo: "",
    taskType: "",
    status: "",
    keyword: ""
  });
  const loading = ref(false);
  const dataList = ref<TaskItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "任务号", prop: "taskNo", minWidth: 130 },
    {
      label: "任务类型",
      minWidth: 80,
      cellRenderer: ({ row }) => dictLabel(taskTypeOptions, row.taskType)
    },
    { label: "关联单据", prop: "bizNo", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "库位", prop: "locationCode", minWidth: 80 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 120 },
    { label: "数量", prop: "qty", minWidth: 60 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(taskStatusOptions, row.status)}>
          {dictLabel(taskStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "执行人", prop: "assignee", minWidth: 80 },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 150, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getTaskPage({
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

  /** 分配任务 */
  function openAssignDialog(row: TaskItem) {
    addDialog({
      title: "分配任务",
      width: "32%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row.id,
          taskNo: row.taskNo,
          assignee: row.assignee ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: { id: number; assignee: string } }
        ).formInline;
        assignTask(formInline.id, formInline.assignee).then(() => {
          message("分配成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 取消任务 */
  function handleCancel(row: TaskItem) {
    ElMessageBox.confirm(`确认取消任务「${row.taskNo}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      cancelTask(row.id).then(() => {
        message("已取消", { type: "success" });
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
    openAssignDialog,
    handleCancel,
    handleSizeChange,
    handleCurrentChange
  };
}

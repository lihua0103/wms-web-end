import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getReplenishPage, addReplenish, finishReplenish } from "@/api/operation";
import type { ReplenishItem } from "@/api/operation";
import { dictTag } from "@/constants/wms";
import formComp from "../form.vue";

const statusOptions = [
  { label: "待执行", value: "pending", tag: "info" },
  { label: "执行中", value: "processing", tag: "primary" },
  { label: "已完成", value: "finished", tag: "success" },
  { label: "已取消", value: "cancelled", tag: "danger" }
];

export function useReplenish() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ReplenishItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "补货单号", prop: "code", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "源库位", prop: "fromLocation", minWidth: 90 },
    { label: "目标库位", prop: "toLocation", minWidth: 90 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 120 },
    { label: "数量", prop: "qty", minWidth: 70 },
    {
      label: "触发方式",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={row.trigger === "auto" ? "warning" : "info"}>
          {row.trigger === "auto" ? "自动" : "手动"}
        </el-tag>
      )
    },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(statusOptions, row.status)}>
          {{ pending: "待执行", processing: "执行中", finished: "已完成", cancelled: "已取消" }[
            row.status
          ] || row.status}
        </el-tag>
      )
    },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 120, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getReplenishPage({
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

  /** 手动补货 */
  function openDialog() {
    addDialog({
      title: "手动补货",
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          warehouseCode: "WH001",
          fromLocation: "",
          toLocation: "",
          materialCode: "",
          materialName: "",
          qty: 1,
          trigger: "manual"
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<ReplenishItem> }
        ).formInline;
        addReplenish(formInline).then(() => {
          message("补货任务已创建", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleFinish(row: ReplenishItem) {
    ElMessageBox.confirm(`确认补货单「${row.code}」已执行完成吗？`, "提示", {
      type: "warning"
    }).then(() => {
      finishReplenish(row.id).then(() => {
        message("补货完成", { type: "success" });
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
    statusOptions,
    onSearch,
    resetForm,
    openDialog,
    handleFinish,
    handleSizeChange,
    handleCurrentChange
  };
}

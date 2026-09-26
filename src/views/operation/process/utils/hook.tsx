import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getProcessPage,
  addProcess,
  updateProcess,
  deleteProcess,
  startProcess,
  finishProcess
} from "@/api/operation";
import type { ProcessOrderItem } from "@/api/operation";
import { docStatusOptions, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

const statusMap: Record<string, string> = {
  pending: "草稿",
  processing: "加工中",
  finished: "已完成",
  cancelled: "已取消"
};

export function useProcess() {
  const form = reactive({
    code: "",
    processType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ProcessOrderItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "加工单号", prop: "code", minWidth: 130 },
    { label: "加工类型", prop: "processType", minWidth: 80 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 120 },
    { label: "投入数量", prop: "inputQty", minWidth: 80 },
    { label: "产出数量", prop: "outputQty", minWidth: 80 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(docStatusOptions, row.status)}>
          {statusMap[row.status] || row.status}
        </el-tag>
      )
    },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 200, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getProcessPage({
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

  /** 新增/编辑加工单 */
  function openDialog(title: string, row?: ProcessOrderItem) {
    addDialog({
      title,
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          processType: row?.processType ?? "贴标",
          warehouseCode: row?.warehouseCode ?? "WH001",
          materialCode: row?.materialCode ?? "",
          materialName: row?.materialName ?? "",
          inputQty: row?.inputQty ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<ProcessOrderItem> }
        ).formInline;
        const req = formInline.id ? updateProcess(formInline) : addProcess(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "创建成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 开工 */
  function handleStart(row: ProcessOrderItem) {
    ElMessageBox.confirm(`确认加工单「${row.code}」开始加工吗？`, "提示", {
      type: "warning"
    }).then(() => {
      startProcess(row.id).then(() => {
        message("已开工", { type: "success" });
        onSearch();
      });
    });
  }

  /** 完工（录入产出数量） */
  function handleFinish(row: ProcessOrderItem) {
    addDialog({
      title: "完工登记",
      width: "32%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row.id,
          processType: row.processType,
          warehouseCode: row.warehouseCode,
          materialCode: row.materialCode,
          materialName: row.materialName,
          inputQty: row.inputQty,
          outputQty: row.outputQty || row.inputQty,
          onlyOutput: true
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: { id: number; outputQty: number } }
        ).formInline;
        finishProcess(formInline.id, formInline.outputQty).then(() => {
          message("完工成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: ProcessOrderItem) {
    ElMessageBox.confirm(`确认删除加工单「${row.code}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteProcess([row.id]).then(() => {
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
    statusMap,
    onSearch,
    resetForm,
    openDialog,
    handleStart,
    handleFinish,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

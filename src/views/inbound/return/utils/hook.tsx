import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getReturnPage,
  addReturn,
  updateReturn,
  deleteReturn,
  approveReturn
} from "@/api/inbound";
import type { ReturnInboundItem } from "@/api/inbound";
import formComp from "../form.vue";

const statusMap: Record<string, { label: string; tag: string }> = {
  pending: { label: "待审核", tag: "warning" },
  approved: { label: "已审核", tag: "primary" },
  receiving: { label: "收货中", tag: "primary" },
  finished: { label: "已完成", tag: "success" },
  cancelled: { label: "已取消", tag: "danger" }
};

export function useReturn() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ReturnInboundItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "退货单号", prop: "code", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "货主", prop: "ownerName", minWidth: 120 },
    { label: "客户", prop: "customerName", minWidth: 120 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 110 },
    { label: "数量", prop: "qty", minWidth: 70 },
    { label: "退货原因", prop: "reason", minWidth: 90 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={statusMap[row.status]?.tag || "info"}>
          {statusMap[row.status]?.label || row.status}
        </el-tag>
      )
    },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 200, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getReturnPage({
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

  function openDialog(title: string, row?: ReturnInboundItem) {
    addDialog({
      title,
      width: "42%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          warehouseCode: row?.warehouseCode ?? "WH001",
          ownerName: row?.ownerName ?? "",
          customerName: row?.customerName ?? "",
          materialCode: row?.materialCode ?? "",
          materialName: row?.materialName ?? "",
          qty: row?.qty ?? 1,
          reason: row?.reason ?? "",
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<ReturnInboundItem> }
        ).formInline;
        const req = formInline.id ? updateReturn(formInline) : addReturn(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "创建成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleApprove(row: ReturnInboundItem, pass: boolean) {
    ElMessageBox.confirm(
      pass ? `确认审批通过「${row.code}」吗？` : `确认取消「${row.code}」吗？`,
      "提示",
      { type: "warning" }
    ).then(() => {
      approveReturn(row.id, pass).then(() => {
        message(pass ? "审批通过" : "已取消", { type: "success" });
        onSearch();
      });
    });
  }

  function handleDelete(row: ReturnInboundItem) {
    ElMessageBox.confirm(`确认删除退货单「${row.code}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteReturn([row.id]).then(() => {
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
    handleApprove,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

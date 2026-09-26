import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getAsnPage,
  addAsn,
  updateAsn,
  deleteAsn,
  approveAsn
} from "@/api/inbound";
import type { AsnItem } from "@/api/inbound";
import { inboundTypeOptions, dictLabel } from "@/constants/wms";
import formComp from "../form.vue";

const statusMap: Record<string, { label: string; tag: string }> = {
  draft: { label: "草稿", tag: "info" },
  pending: { label: "待审核", tag: "warning" },
  approved: { label: "已审核", tag: "primary" },
  finished: { label: "已完成", tag: "success" },
  cancelled: { label: "已取消", tag: "danger" }
};

export function useAsn() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    type: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<AsnItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "预约单号", prop: "code", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "货主", prop: "ownerName", minWidth: 120 },
    { label: "供应商", prop: "supplierName", minWidth: 130 },
    {
      label: "类型",
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(inboundTypeOptions, row.type)
    },
    { label: "预计到货", prop: "expectedArrival", minWidth: 140 },
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
      const { data } = await getAsnPage({
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

  function openDialog(title: string, row?: AsnItem) {
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
          supplierName: row?.supplierName ?? "",
          type: row?.type ?? "purchase",
          expectedArrival: row?.expectedArrival ?? "",
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<AsnItem> }
        ).formInline;
        const req = formInline.id ? updateAsn(formInline) : addAsn(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "创建成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleApprove(row: AsnItem, pass: boolean) {
    ElMessageBox.confirm(
      pass ? `确认审核通过「${row.code}」吗？` : `确认取消「${row.code}」吗？`,
      "提示",
      { type: "warning" }
    ).then(() => {
      approveAsn(row.id, pass).then(() => {
        message(pass ? "审核通过" : "已取消", { type: "success" });
        onSearch();
      });
    });
  }

  function handleDelete(row: AsnItem) {
    ElMessageBox.confirm(`确认删除预约单「${row.code}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteAsn([row.id]).then(() => {
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
    inboundTypeOptions,
    onSearch,
    resetForm,
    openDialog,
    handleApprove,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

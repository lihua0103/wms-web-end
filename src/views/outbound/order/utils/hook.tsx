import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getOutboundPage,
  getOutboundDetail,
  addOutbound,
  updateOutbound,
  deleteOutbound,
  approveOutbound
} from "@/api/outbound";
import type { OutboundOrderItem } from "@/api/outbound";
import {
  outboundTypeOptions,
  outboundStatusOptions,
  priorityOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import formComp from "../form.vue";

export function useOutboundOrder() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    type: "",
    status: "",
    priority: ""
  });
  const loading = ref(false);
  const dataList = ref<OutboundOrderItem[]>([]);
  const detailVisible = ref(false);
  const currentRow = ref<OutboundOrderItem>();

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "出库单号", prop: "code", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "客户", prop: "customerName", minWidth: 120 },
    {
      label: "类型",
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(outboundTypeOptions, row.type)
    },
    {
      label: "优先级",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(priorityOptions, row.priority)}>
          {dictLabel(priorityOptions, row.priority)}
        </el-tag>
      )
    },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "数量", prop: "qty", minWidth: 70 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(outboundStatusOptions, row.status)}>
          {dictLabel(outboundStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "交期", prop: "deliveryDate", minWidth: 90 },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 220, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getOutboundPage({
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

  async function openDetail(row: OutboundOrderItem) {
    const { data } = await getOutboundDetail(row.id);
    currentRow.value = data;
    detailVisible.value = true;
  }

  function openDialog(title: string, row?: OutboundOrderItem) {
    addDialog({
      title,
      width: "44%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          warehouseCode: row?.warehouseCode ?? "WH001",
          customerName: row?.customerName ?? "",
          type: row?.type ?? "sales",
          priority: row?.priority ?? "normal",
          materialCode: row?.materialCode ?? "",
          materialName: row?.materialName ?? "",
          qty: row?.qty ?? 1,
          deliveryDate: row?.deliveryDate ?? "",
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<OutboundOrderItem> }
        ).formInline;
        const req = formInline.id ? updateOutbound(formInline) : addOutbound(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "创建成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleApprove(row: OutboundOrderItem, pass: boolean) {
    ElMessageBox.confirm(
      pass ? `确认审核通过「${row.code}」吗？` : `确认取消「${row.code}」吗？`,
      "提示",
      { type: "warning" }
    ).then(() => {
      approveOutbound(row.id, pass).then(() => {
        message(pass ? "审核通过" : "已取消", { type: "success" });
        onSearch();
      });
    });
  }

  function handleDelete(row: OutboundOrderItem) {
    ElMessageBox.confirm(`确认删除出库单「${row.code}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteOutbound([row.id]).then(() => {
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
    detailVisible,
    currentRow,
    onSearch,
    resetForm,
    openDetail,
    openDialog,
    handleApprove,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

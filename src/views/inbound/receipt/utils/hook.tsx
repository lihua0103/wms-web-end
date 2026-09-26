import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getReceiptPage,
  auditReceipt,
  registerReceipt
} from "@/api/inbound";
import type { ReceiptItem } from "@/api/inbound";
import { inboundStatusOptions, dictTag, dictLabel } from "@/constants/wms";
import formComp from "../form.vue";

export function useReceipt() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    materialCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ReceiptItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "收货单号", prop: "code", minWidth: 130 },
    { label: "预约单号", prop: "asnCode", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "供应商", prop: "supplierName", minWidth: 120 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 110 },
    { label: "批次", prop: "batchNo", minWidth: 80 },
    { label: "实收", prop: "receivedQty", minWidth: 60 },
    { label: "合格", prop: "qualifiedQty", minWidth: 60 },
    { label: "不合格", prop: "rejectedQty", minWidth: 60 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(inboundStatusOptions, row.status)}>
          {dictLabel(inboundStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "收货人", prop: "receiver", minWidth: 70 },
    { fixed: "right", label: "操作", width: 170, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getReceiptPage({
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

  /** 审核（待审核→待到货） */
  function handleAudit(row: ReceiptItem) {
    ElMessageBox.confirm(`确认审核通过「${row.code}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      auditReceipt(row.id).then(() => {
        message("审核通过", { type: "success" });
        onSearch();
      });
    });
  }

  /** 收货登记 */
  function openRegisterDialog(row: ReceiptItem) {
    addDialog({
      title: "收货登记",
      width: "36%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row.id,
          code: row.code,
          materialName: row.materialName,
          receivedQty: row.receivedQty,
          qualifiedQty: row.qualifiedQty,
          rejectedQty: row.rejectedQty
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as {
            formInline: {
              id: number;
              receivedQty: number;
              qualifiedQty: number;
              rejectedQty: number;
            };
          }
        ).formInline;
        registerReceipt(formInline).then(() => {
          message("收货登记成功", { type: "success" });
          done();
          onSearch();
        });
      }
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
    handleAudit,
    openRegisterDialog,
    handleSizeChange,
    handleCurrentChange
  };
}

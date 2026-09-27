import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { $t } from "@/plugins/i18n";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getReceiptPage, auditReceipt, registerReceipt } from "@/api/inbound";
import type { ReceiptItem } from "@/api/inbound";
import { inboundStatusOptions, dictTag, dictLabel } from "@/constants/wms";
import EditPen from "~icons/ep/edit-pen";
import CircleCheck from "~icons/ep/circle-check";
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
    { label: $t("inbound.receipt.receiptNo"), prop: "code", minWidth: 130 },
    { label: $t("inbound.receipt.asnNo"), prop: "asnCode", minWidth: 130 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    {
      label: $t("inbound.receipt.supplier"),
      prop: "supplierName",
      minWidth: 120
    },
    {
      label: $t("inbound.receipt.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inbound.receipt.materialName"),
      prop: "materialName",
      minWidth: 110
    },
    { label: $t("inbound.receipt.batch"), prop: "batchNo", minWidth: 80 },
    {
      label: $t("inbound.receipt.received"),
      prop: "receivedQty",
      minWidth: 60
    },
    {
      label: $t("inbound.receipt.qualified"),
      prop: "qualifiedQty",
      minWidth: 60
    },
    {
      label: $t("inbound.receipt.rejected"),
      prop: "rejectedQty",
      minWidth: 60
    },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(inboundStatusOptions, row.status)}>
          {dictLabel(inboundStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: $t("inbound.receipt.receiver"), prop: "receiver", minWidth: 70 },
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

  function operationButtons(row: ReceiptItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "pending") {
      buttons.push({
        label: $t("common.buttons.audit"),
        icon: CircleCheck,
        onClick: () => handleAudit(row)
      });
    }
    if (["waiting", "receiving"].includes(row.status)) {
      buttons.push({
        label: $t("inbound.receipt.register"),
        icon: EditPen,
        onClick: () => openRegisterDialog(row)
      });
    }
    return buttons;
  }

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
    ElMessageBox.confirm(
      $t("inbound.receipt.confirmApprove", { code: row.code }),
      $t("inbound.receipt.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      auditReceipt(row.id).then(() => {
        message($t("inbound.receipt.auditSuccess"), { type: "success" });
        onSearch();
      });
    });
  }

  /** 收货登记 */
  function openRegisterDialog(row: ReceiptItem) {
    addDialog({
      title: $t("inbound.receipt.register"),
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
          message($t("inbound.receipt.registerSuccess"), { type: "success" });
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

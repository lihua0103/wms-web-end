import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { $t } from "@/plugins/i18n";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getReturnPage,
  addReturn,
  updateReturn,
  deleteReturn,
  approveReturn
} from "@/api/inbound";
import type { ReturnInboundItem } from "@/api/inbound";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import CircleCheck from "~icons/ep/circle-check";
import CircleClose from "~icons/ep/circle-close";
import formComp from "../form.vue";

export function useReturn() {
  const statusMap: Record<string, { label: string; tag: string }> = {
    pending: { label: $t("inbound.return.statusPending"), tag: "warning" },
    approved: { label: $t("inbound.return.statusApproved"), tag: "primary" },
    receiving: { label: $t("inbound.return.statusReceiving"), tag: "primary" },
    finished: { label: $t("inbound.return.statusFinished"), tag: "success" },
    cancelled: { label: $t("inbound.return.statusCancelled"), tag: "danger" }
  };

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
    { label: $t("inbound.return.returnNo"), prop: "code", minWidth: 130 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    { label: $t("common.columns.owner"), prop: "ownerName", minWidth: 120 },
    {
      label: $t("inbound.return.customer"),
      prop: "customerName",
      minWidth: 120
    },
    {
      label: $t("inbound.return.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inbound.return.materialName"),
      prop: "materialName",
      minWidth: 110
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 70 },
    { label: $t("inbound.return.reason"), prop: "reason", minWidth: 90 },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={statusMap[row.status]?.tag || "info"}>
          {statusMap[row.status]?.label || row.status}
        </el-tag>
      )
    },
    {
      label: $t("common.columns.createTime"),
      prop: "createdAt",
      minWidth: 140
    },
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

  function operationButtons(row: ReturnInboundItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "pending") {
      buttons.push(
        {
          label: $t("common.buttons.edit"),
          icon: EditPen,
          onClick: () => openDialog($t("inbound.return.edit"), row)
        },
        {
          label: $t("inbound.return.approve"),
          type: "success",
          icon: CircleCheck,
          onClick: () => handleApprove(row, true)
        },
        {
          label: $t("common.buttons.cancel"),
          type: "warning",
          icon: CircleClose,
          onClick: () => handleApprove(row, false)
        },
        {
          label: $t("common.buttons.delete"),
          type: "danger",
          icon: Delete,
          onClick: () => handleDelete(row)
        }
      );
    }
    return buttons;
  }

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
        const req = formInline.id
          ? updateReturn(formInline)
          : addReturn(formInline);
        req.then(() => {
          message(
            $t(
              formInline.id
                ? "inbound.return.updateSuccess"
                : "inbound.return.createSuccess"
            ),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleApprove(row: ReturnInboundItem, pass: boolean) {
    ElMessageBox.confirm(
      $t(
        pass ? "inbound.return.confirmApprove" : "inbound.return.confirmCancel",
        { code: row.code }
      ),
      $t("inbound.return.tip"),
      { type: "warning" }
    ).then(() => {
      approveReturn(row.id, pass).then(() => {
        message(
          $t(
            pass
              ? "inbound.return.approveSuccess"
              : "inbound.return.cancelledMsg"
          ),
          { type: "success" }
        );
        onSearch();
      });
    });
  }

  function handleDelete(row: ReturnInboundItem) {
    ElMessageBox.confirm(
      $t("inbound.return.confirmDelete", { code: row.code }),
      $t("inbound.return.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteReturn([row.id]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
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

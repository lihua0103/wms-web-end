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
  getAsnPage,
  addAsn,
  updateAsn,
  deleteAsn,
  approveAsn
} from "@/api/inbound";
import type { AsnItem } from "@/api/inbound";
import { inboundTypeOptions, dictLabel } from "@/constants/wms";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import CircleCheck from "~icons/ep/circle-check";
import CircleClose from "~icons/ep/circle-close";
import formComp from "../form.vue";

export function useAsn() {
  const statusMap: Record<string, { label: string; tag: string }> = {
    draft: { label: $t("inbound.asn.statusDraft"), tag: "info" },
    pending: { label: $t("inbound.asn.statusPending"), tag: "warning" },
    approved: { label: $t("inbound.asn.statusApproved"), tag: "primary" },
    finished: { label: $t("inbound.asn.statusFinished"), tag: "success" },
    cancelled: { label: $t("inbound.asn.statusCancelled"), tag: "danger" }
  };

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
    { label: $t("inbound.asn.asnNo"), prop: "code", minWidth: 130 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    { label: $t("common.columns.owner"), prop: "ownerName", minWidth: 120 },
    { label: $t("inbound.asn.supplier"), prop: "supplierName", minWidth: 130 },
    {
      label: $t("common.columns.type"),
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(inboundTypeOptions, row.type)
    },
    {
      label: $t("inbound.asn.expectedArrival"),
      prop: "expectedArrival",
      minWidth: 140
    },
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

  function operationButtons(row: AsnItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (["draft", "pending"].includes(row.status)) {
      buttons.push({
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("inbound.asn.edit"), row)
      });
    }
    if (row.status === "pending") {
      buttons.push({
        label: $t("common.buttons.audit"),
        type: "success",
        icon: CircleCheck,
        onClick: () => handleApprove(row, true)
      });
    }
    if (["draft", "pending"].includes(row.status)) {
      buttons.push({
        label: $t("common.buttons.cancel"),
        type: "warning",
        icon: CircleClose,
        onClick: () => handleApprove(row, false)
      });
    }
    if (row.status === "draft") {
      buttons.push({
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      });
    }
    return buttons;
  }

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
        const formInline = (options.props as { formInline: Partial<AsnItem> })
          .formInline;
        const req = formInline.id ? updateAsn(formInline) : addAsn(formInline);
        req.then(() => {
          message(
            $t(
              formInline.id
                ? "inbound.asn.updateSuccess"
                : "inbound.asn.createSuccess"
            ),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleApprove(row: AsnItem, pass: boolean) {
    ElMessageBox.confirm(
      $t(pass ? "inbound.asn.confirmApprove" : "inbound.asn.confirmCancel", {
        code: row.code
      }),
      $t("inbound.asn.tip"),
      { type: "warning" }
    ).then(() => {
      approveAsn(row.id, pass).then(() => {
        message(
          $t(pass ? "inbound.asn.approveSuccess" : "inbound.asn.cancelledMsg"),
          { type: "success" }
        );
        onSearch();
      });
    });
  }

  function handleDelete(row: AsnItem) {
    ElMessageBox.confirm(
      $t("inbound.asn.confirmDelete", { code: row.code }),
      $t("inbound.asn.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteAsn([row.id]).then(() => {
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

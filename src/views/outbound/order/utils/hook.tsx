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
import View from "~icons/ep/view";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import CircleCheck from "~icons/ep/circle-check";
import CircleClose from "~icons/ep/circle-close";
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
    { label: $t("outbound.order.orderNo"), prop: "code", minWidth: 130 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    {
      label: $t("outbound.order.customer"),
      prop: "customerName",
      minWidth: 120
    },
    {
      label: $t("common.columns.type"),
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(outboundTypeOptions, row.type)
    },
    {
      label: $t("outbound.order.priority"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(priorityOptions, row.priority)}>
          {dictLabel(priorityOptions, row.priority)}
        </el-tag>
      )
    },
    {
      label: $t("outbound.order.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 70 },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(outboundStatusOptions, row.status)}>
          {dictLabel(outboundStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: $t("outbound.order.dueDate"), prop: "deliveryDate", minWidth: 90 },
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

  function operationButtons(row: OutboundOrderItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.detail"),
        icon: View,
        onClick: () => openDetail(row)
      }
    ];
    if (row.status === "pending") {
      buttons.push(
        {
          label: $t("common.buttons.edit"),
          icon: EditPen,
          onClick: () => openDialog($t("outbound.order.editOrder"), row)
        },
        {
          label: $t("common.buttons.audit"),
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
        const req = formInline.id
          ? updateOutbound(formInline)
          : addOutbound(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("outbound.order.updateSuccess")
              : $t("outbound.order.createSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleApprove(row: OutboundOrderItem, pass: boolean) {
    ElMessageBox.confirm(
      pass
        ? $t("outbound.order.approvePassTip", { code: row.code })
        : $t("outbound.order.cancelTip", { code: row.code }),
      $t("outbound.order.tip"),
      { type: "warning" }
    ).then(() => {
      approveOutbound(row.id, pass).then(() => {
        message(
          pass
            ? $t("outbound.order.approvePassed")
            : $t("outbound.order.cancelled"),
          { type: "success" }
        );
        onSearch();
      });
    });
  }

  function handleDelete(row: OutboundOrderItem) {
    ElMessageBox.confirm(
      $t("outbound.order.deleteTip", { code: row.code }),
      $t("outbound.order.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteOutbound([row.id]).then(() => {
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

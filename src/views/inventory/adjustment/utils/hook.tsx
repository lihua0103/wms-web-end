import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getAdjustmentPage,
  addAdjustment,
  approveAdjustment
} from "@/api/inventory";
import type { AdjustmentItem } from "@/api/inventory";
import {
  adjustTypeOptions,
  adjustStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import Check from "~icons/ep/check";
import Close from "~icons/ep/close";
import formComp from "../form.vue";

export function useAdjustment() {
  const form = reactive({
    code: "",
    adjustType: "",
    materialCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<AdjustmentItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("inventory.adjustment.docNo"), prop: "code", minWidth: 130 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 100
    },
    {
      label: $t("common.columns.location"),
      prop: "locationCode",
      minWidth: 90
    },
    {
      label: $t("inventory.adjustment.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inventory.adjustment.materialName"),
      prop: "materialName",
      minWidth: 130
    },
    {
      label: $t("inventory.adjustment.batch"),
      prop: "batchNo",
      minWidth: 90
    },
    {
      label: $t("inventory.adjustment.adjustType"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(adjustTypeOptions, row.adjustType)}>
          {dictLabel(adjustTypeOptions, row.adjustType)}
        </el-tag>
      )
    },
    {
      label: $t("inventory.adjustment.beforeQty"),
      prop: "qtyBefore",
      minWidth: 90
    },
    {
      label: $t("inventory.adjustment.changeQty"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <span
          style={
            row.qtyChange > 0
              ? "color:#67c23a"
              : "color:#f56c6c;font-weight:600"
          }
        >
          {row.qtyChange > 0 ? `+${row.qtyChange}` : row.qtyChange}
        </span>
      )
    },
    {
      label: $t("inventory.adjustment.afterQty"),
      prop: "qtyAfter",
      minWidth: 90
    },
    {
      label: $t("inventory.adjustment.reason"),
      prop: "reason",
      minWidth: 110
    },
    {
      label: $t("common.columns.status"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(adjustStatusOptions, row.status)}>
          {dictLabel(adjustStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("inventory.adjustment.applicant"),
      prop: "applicant",
      minWidth: 90
    },
    {
      label: $t("common.columns.createTime"),
      prop: "createdAt",
      minWidth: 150
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

  function operationButtons(row: AdjustmentItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "pending") {
      buttons.push(
        {
          label: $t("inventory.adjustment.approve"),
          type: "success",
          icon: Check,
          onClick: () => handleApprove(row, true)
        },
        {
          label: $t("inventory.adjustment.reject"),
          type: "danger",
          icon: Close,
          onClick: () => handleApprove(row, false)
        }
      );
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getAdjustmentPage({
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

  /** 新增调整单 */
  function openDialog() {
    addDialog({
      title: $t("inventory.adjustment.addTitle"),
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          warehouseCode: "WH001",
          materialCode: "",
          materialName: "",
          batchNo: "",
          locationCode: "",
          adjustType: "gain",
          qtyBefore: 0,
          qtyChange: 0,
          reason: ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<AdjustmentItem> }
        ).formInline;
        if (!formInline.qtyChange) {
          message($t("inventory.adjustment.qtyChangeRequired"), {
            type: "warning"
          });
          return;
        }
        addAdjustment(formInline).then(() => {
          message($t("inventory.adjustment.createSuccess"), {
            type: "success"
          });
          done();
          onSearch();
        });
      }
    });
  }

  /** 审批通过/驳回 */
  function handleApprove(row: AdjustmentItem, pass: boolean) {
    ElMessageBox.confirm(
      pass
        ? $t("inventory.adjustment.approveTip", { code: row.code })
        : $t("inventory.adjustment.rejectTip", { code: row.code }),
      $t("inventory.adjustment.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      approveAdjustment(row.id, pass).then(() => {
        message(
          pass
            ? $t("inventory.adjustment.approved")
            : $t("inventory.adjustment.rejected"),
          { type: "success" }
        );
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
    adjustTypeOptions,
    adjustStatusOptions,
    onSearch,
    resetForm,
    openDialog,
    handleApprove,
    handleSizeChange,
    handleCurrentChange
  };
}

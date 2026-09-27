import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getReplenishPage,
  addReplenish,
  finishReplenish
} from "@/api/operation";
import type { ReplenishItem } from "@/api/operation";
import { dictTag } from "@/constants/wms";
import type { DictItem } from "@/constants/wms";
import CircleCheck from "~icons/ep/circle-check";
import formComp from "../form.vue";

export function useReplenish() {
  const statusOptions: DictItem[] = [
    {
      label: $t("operation.replenish.statusPending"),
      value: "pending",
      tag: "info"
    },
    {
      label: $t("operation.replenish.statusProcessing"),
      value: "processing",
      tag: "primary"
    },
    {
      label: $t("operation.replenish.statusFinished"),
      value: "finished",
      tag: "success"
    },
    {
      label: $t("operation.replenish.statusCancelled"),
      value: "cancelled",
      tag: "danger"
    }
  ];

  const form = reactive({
    code: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ReplenishItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("operation.replenish.code"), prop: "code", minWidth: 130 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    {
      label: $t("operation.replenish.fromLocation"),
      prop: "fromLocation",
      minWidth: 90
    },
    {
      label: $t("operation.replenish.toLocation"),
      prop: "toLocation",
      minWidth: 90
    },
    {
      label: $t("operation.replenish.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("operation.replenish.materialName"),
      prop: "materialName",
      minWidth: 120
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 70 },
    {
      label: $t("operation.replenish.triggerType"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={row.trigger === "auto" ? "warning" : "info"}>
          {row.trigger === "auto"
            ? $t("operation.replenish.triggerAuto")
            : $t("operation.replenish.triggerManual")}
        </el-tag>
      )
    },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(statusOptions, row.status)}>
          {{
            pending: $t("operation.replenish.statusPending"),
            processing: $t("operation.replenish.statusProcessing"),
            finished: $t("operation.replenish.statusFinished"),
            cancelled: $t("operation.replenish.statusCancelled")
          }[row.status] || row.status}
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

  function operationButtons(row: ReplenishItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (["pending", "processing"].includes(row.status)) {
      buttons.push({
        label: $t("common.buttons.complete"),
        type: "success",
        icon: CircleCheck,
        onClick: () => handleFinish(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getReplenishPage({
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

  /** 手动补货 */
  function openDialog() {
    addDialog({
      title: $t("operation.replenish.manualReplenish"),
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          warehouseCode: "WH001",
          fromLocation: "",
          toLocation: "",
          materialCode: "",
          materialName: "",
          qty: 1,
          trigger: "manual"
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<ReplenishItem> }
        ).formInline;
        addReplenish(formInline).then(() => {
          message($t("operation.replenish.createSuccess"), { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleFinish(row: ReplenishItem) {
    ElMessageBox.confirm(
      $t("operation.replenish.finishConfirm", { code: row.code }),
      $t("operation.replenish.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      finishReplenish(row.id).then(() => {
        message($t("operation.replenish.finishSuccess"), { type: "success" });
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
    statusOptions,
    onSearch,
    resetForm,
    openDialog,
    handleFinish,
    handleSizeChange,
    handleCurrentChange
  };
}

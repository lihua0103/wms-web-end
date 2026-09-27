import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getStocktakePage,
  addStocktake,
  startStocktake,
  submitStocktakeDiff,
  finishStocktake,
  cancelStocktake,
  getStocktakeDetailPage,
  saveStocktakeActual
} from "@/api/inventory";
import type { StocktakeItem, StocktakeDetailItem } from "@/api/inventory";
import {
  stocktakeStatusOptions,
  stocktakeModeOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import View from "~icons/ep/view";
import formComp from "../form.vue";

export function useStocktake() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<StocktakeItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("inventory.stocktake.stocktakeNo"),
      prop: "code",
      minWidth: 130
    },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 80
    },
    {
      label: $t("inventory.stocktake.mode"),
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(stocktakeModeOptions, row.mode)
    },
    {
      label: $t("inventory.stocktake.planDate"),
      prop: "planDate",
      minWidth: 90
    },
    {
      label: $t("common.columns.status"),
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(stocktakeStatusOptions, row.status)}>
          {dictLabel(stocktakeStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("inventory.stocktake.itemCount"),
      prop: "totalCount",
      minWidth: 80
    },
    {
      label: $t("inventory.stocktake.diffCount"),
      prop: "diffCount",
      minWidth: 70
    },
    { label: $t("common.columns.creator"), prop: "creator", minWidth: 80 },
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

  function operationButtons(row: StocktakeItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("inventory.stocktake.detail"),
        icon: View,
        onClick: () => openDetail(row)
      }
    ];
    if (row.status === "draft") {
      buttons.push({
        label: $t("inventory.stocktake.start"),
        onClick: () => onAction(row, "start")
      });
    }
    if (row.status === "counting") {
      buttons.push({
        label: $t("inventory.stocktake.submitDiff"),
        type: "warning",
        onClick: () => onAction(row, "submit")
      });
    }
    if (row.status === "diff") {
      buttons.push({
        label: $t("common.buttons.complete"),
        type: "success",
        onClick: () => onAction(row, "finish")
      });
    }
    if (["draft", "counting", "diff"].includes(row.status)) {
      buttons.push({
        label: $t("common.buttons.cancel"),
        type: "danger",
        onClick: () => onAction(row, "cancel")
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getStocktakePage({
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

  /** 创建盘点单 */
  function openDialog() {
    addDialog({
      title: $t("inventory.stocktake.create"),
      width: "38%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          warehouseCode: "WH001",
          mode: "full",
          planDate: ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<StocktakeItem> }
        ).formInline;
        addStocktake(formInline).then(() => {
          message($t("inventory.stocktake.createSuccess"), { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 状态流转 */
  function onAction(
    row: StocktakeItem,
    action: "start" | "submit" | "finish" | "cancel"
  ) {
    const map = {
      start: [
        startStocktake,
        $t("inventory.stocktake.started"),
        $t("inventory.stocktake.startTip")
      ],
      submit: [
        submitStocktakeDiff,
        $t("inventory.stocktake.diffSubmitted"),
        $t("inventory.stocktake.submitDiffTip")
      ],
      finish: [
        finishStocktake,
        $t("inventory.stocktake.finished"),
        $t("inventory.stocktake.finishTip")
      ],
      cancel: [
        cancelStocktake,
        $t("inventory.stocktake.cancelled"),
        $t("inventory.stocktake.cancelTip")
      ]
    } as const;
    const [api, msg, tip] = map[action];
    ElMessageBox.confirm(tip as string, $t("inventory.stocktake.tip"), {
      type: "warning"
    }).then(() => {
      (api as (id: number) => Promise<any>)(row.id).then(() => {
        message(msg as string, { type: "success" });
        onSearch();
      });
    });
  }

  // ========================= 盘点明细 =========================

  const detailVisible = ref(false);
  const currentStocktake = ref<StocktakeItem>();
  const detailLoading = ref(false);
  const detailList = ref<StocktakeDetailItem[]>([]);
  const detailPagination = reactive({ pageSize: 20, currentPage: 1, total: 0 });

  const detailColumns: TableColumnList = [
    {
      label: $t("common.columns.location"),
      prop: "locationCode",
      minWidth: 80
    },
    {
      label: $t("inventory.stocktake.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inventory.stocktake.materialName"),
      prop: "materialName",
      minWidth: 120
    },
    { label: $t("inventory.stocktake.batch"), prop: "batchNo", minWidth: 80 },
    { label: $t("inventory.stocktake.bookQty"), prop: "bookQty", minWidth: 70 },
    {
      label: $t("inventory.stocktake.actualQty"),
      slot: "actual",
      minWidth: 130
    },
    {
      label: $t("inventory.stocktake.diffCount"),
      prop: "diffQty",
      minWidth: 70
    },
    { label: $t("common.columns.operation"), slot: "dop", minWidth: 70 }
  ];

  async function openDetail(row: StocktakeItem) {
    currentStocktake.value = row;
    detailVisible.value = true;
    detailPagination.currentPage = 1;
    await fetchDetail();
  }

  async function fetchDetail() {
    if (!currentStocktake.value) return;
    detailLoading.value = true;
    try {
      const { data } = await getStocktakeDetailPage({
        stocktakeId: currentStocktake.value.id,
        page: detailPagination.currentPage,
        pageSize: detailPagination.pageSize
      });
      detailList.value = data.list;
      detailPagination.total = data.total;
    } finally {
      detailLoading.value = false;
    }
  }

  function saveActual(row: StocktakeDetailItem) {
    if (row.actualQty === null || row.actualQty === undefined) {
      message($t("inventory.stocktake.inputActualFirst"), { type: "warning" });
      return;
    }
    saveStocktakeActual(row.id, row.actualQty).then(() => {
      message($t("inventory.stocktake.saved"), { type: "success" });
      fetchDetail();
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
    openDialog,
    onAction,
    detailVisible,
    currentStocktake,
    detailLoading,
    detailList,
    detailPagination,
    detailColumns,
    openDetail,
    fetchDetail,
    saveActual,
    handleSizeChange,
    handleCurrentChange
  };
}

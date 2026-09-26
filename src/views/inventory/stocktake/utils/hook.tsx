import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
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
    { label: "盘点单号", prop: "code", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 80 },
    {
      label: "盘点方式",
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(stocktakeModeOptions, row.mode)
    },
    { label: "计划日期", prop: "planDate", minWidth: 90 },
    {
      label: "状态",
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(stocktakeStatusOptions, row.status)}>
          {dictLabel(stocktakeStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "盘点项数", prop: "totalCount", minWidth: 80 },
    { label: "差异数", prop: "diffCount", minWidth: 70 },
    { label: "创建人", prop: "creator", minWidth: 80 },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 240, slot: "operation" }
  ];

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
      title: "创建盘点单",
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
          message("创建成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 状态流转 */
  function onAction(row: StocktakeItem, action: "start" | "submit" | "finish" | "cancel") {
    const map = {
      start: [startStocktake, "盘点已开始", "确认开始盘点吗？"],
      submit: [submitStocktakeDiff, "差异已提交", "确认提交盘点差异吗？"],
      finish: [finishStocktake, "盘点完成，差异已生成调整单", "确认完成盘点并生成调整单吗？"],
      cancel: [cancelStocktake, "已取消", "确认取消该盘点单吗？"]
    } as const;
    const [api, msg, tip] = map[action];
    ElMessageBox.confirm(tip as string, "提示", { type: "warning" }).then(() => {
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
    { label: "库位", prop: "locationCode", minWidth: 80 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 120 },
    { label: "批次", prop: "batchNo", minWidth: 80 },
    { label: "账面数", prop: "bookQty", minWidth: 70 },
    { label: "实际数", slot: "actual", minWidth: 130 },
    { label: "差异数", prop: "diffQty", minWidth: 70 },
    { label: "操作", slot: "dop", minWidth: 70 }
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
      message("请先录入实际数量", { type: "warning" });
      return;
    }
    saveStocktakeActual(row.id, row.actualQty).then(() => {
      message("已保存", { type: "success" });
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

import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getTripleDocPage, pushTripleDoc } from "@/api/customs";
import type { TripleDocItem } from "@/api/customs";
import {
  dictLabel,
  dictTag,
  tripleDocTypeOptions,
  tripleStatusOptions,
  triplePlatformOptions
} from "@/constants/wms";
import View from "~icons/ep/view";
import Promotion from "~icons/ep/promotion";

export function useCustomsTriple() {
  const form = reactive({
    docNo: "",
    orderNo: "",
    docType: "",
    platform: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<TripleDocItem[]>([]);

  /** 详情抽屉 */
  const detailVisible = ref(false);
  const currentRow = ref<TripleDocItem | null>(null);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("customs.triple.docNo"), prop: "docNo", minWidth: 140 },
    {
      label: $t("customs.triple.docType"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(tripleDocTypeOptions, row.docType)}>
          {dictLabel(tripleDocTypeOptions, row.docType)}
        </el-tag>
      )
    },
    {
      label: $t("customs.triple.platformFull"),
      minWidth: 110,
      cellRenderer: ({ row }) => dictLabel(triplePlatformOptions, row.platform)
    },
    { label: $t("customs.triple.relOrderNo"), prop: "orderNo", minWidth: 150 },
    {
      label: $t("customs.triple.extNo"),
      prop: "extNo",
      minWidth: 150,
      cellRenderer: ({ row }) => (
        <span>
          {row.extNo}
          <span class="ml-1 text-xs text-slate-400">
            {row.docType === "payment"
              ? $t("customs.triple.paymentNoNote")
              : row.docType === "logistics"
                ? $t("customs.triple.logisticsNoNote")
                : ""}
          </span>
        </span>
      )
    },
    {
      label: $t("customs.triple.amountCol"),
      minWidth: 100,
      cellRenderer: ({ row }) =>
        row.docType === "logistics" ? "-" : `¥${row.amount.toFixed(2)}`
    },
    { label: $t("customs.triple.consignee"), prop: "consignee", minWidth: 90 },
    {
      label: $t("customs.triple.matchStatus"),
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(tripleStatusOptions, row.status)}>
          {dictLabel(tripleStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: $t("customs.triple.pushTime"), prop: "pushTime", minWidth: 140 },
    { label: $t("customs.triple.matchTime"), prop: "matchTime", minWidth: 140 },
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

  function operationButtons(row: TripleDocItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.detail"),
        icon: View,
        onClick: () => openDetail(row)
      }
    ];
    if (row.status === "pending" || row.status === "failed") {
      buttons.push({
        label:
          row.status === "failed"
            ? $t("customs.triple.repush")
            : $t("customs.triple.push"),
        type: "warning",
        icon: Promotion,
        onClick: () => handlePush(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getTripleDocPage({
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

  /** 推送三单至海关（待推送/对碰失败 → 已推送 → 对碰成功） */
  function handlePush(row: TripleDocItem) {
    ElMessageBox.confirm(
      $t("customs.triple.confirmPush", {
        type: dictLabel(tripleDocTypeOptions, row.docType),
        no: row.docNo
      }),
      $t("customs.triple.pushTitle"),
      { type: "warning" }
    ).then(() => {
      pushTripleDoc(row.id).then(() => {
        message($t("customs.triple.pushedTip", { no: row.docNo }), {
          type: "success"
        });
        onSearch();
      });
    });
  }

  /** 详情抽屉 */
  function openDetail(row: TripleDocItem) {
    currentRow.value = row;
    detailVisible.value = true;
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
    handlePush,
    openDetail,
    handleSizeChange,
    handleCurrentChange
  };
}

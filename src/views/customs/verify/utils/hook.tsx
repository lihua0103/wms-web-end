import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getVerifyListPage,
  declareVerifyList,
  syncVerifyReceipt
} from "@/api/customs";
import type { VerifyListItem } from "@/api/customs";
import {
  dictLabel,
  dictTag,
  customsVerifyTypeOptions,
  customsVerifyStatusOptions,
  supervisionModeOptions
} from "@/constants/wms";
import View from "~icons/ep/view";
import Position from "~icons/ep/position";
import RefreshRight from "~icons/ep/refresh-right";

export function useCustomsVerify() {
  const form = reactive({
    listNo: "",
    bizNo: "",
    listType: "",
    supervisionMode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<VerifyListItem[]>([]);

  /** 详情抽屉 */
  const detailVisible = ref(false);
  const currentRow = ref<VerifyListItem | null>(null);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("customs.verify.listNo"), prop: "listNo", minWidth: 140 },
    {
      label: $t("common.columns.type"),
      minWidth: 110,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(customsVerifyTypeOptions, row.listType)}>
          {dictLabel(customsVerifyTypeOptions, row.listType)}
        </el-tag>
      )
    },
    {
      label: $t("customs.verify.supervisionMode"),
      minWidth: 150,
      cellRenderer: ({ row }) =>
        dictLabel(supervisionModeOptions, row.supervisionMode)
    },
    { label: $t("customs.verify.relBizNo"), prop: "bizNo", minWidth: 130 },
    { label: $t("customs.verify.ledgerNo"), prop: "ledgerNo", minWidth: 130 },
    { label: $t("customs.verify.packCount"), prop: "packCount", minWidth: 80 },
    {
      label: $t("customs.verify.grossWeightKg"),
      prop: "grossWeight",
      minWidth: 90
    },
    {
      label: $t("customs.verify.netWeightKg"),
      prop: "netWeight",
      minWidth: 90
    },
    {
      label: $t("common.columns.status"),
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(customsVerifyStatusOptions, row.status)}>
          {dictLabel(customsVerifyStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("customs.verify.declareTime"),
      prop: "declareTime",
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

  function operationButtons(row: VerifyListItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.detail"),
        icon: View,
        onClick: () => openDetail(row)
      }
    ];
    if (row.status === "draft" || row.status === "refused") {
      buttons.push({
        label:
          row.status === "refused"
            ? $t("customs.verify.redeclare")
            : $t("common.buttons.declare"),
        type: "warning",
        icon: Position,
        onClick: () => handleDeclare(row)
      });
    }
    if (row.status === "declared" || row.status === "passed") {
      buttons.push({
        label: $t("customs.verify.syncReceipt"),
        type: "success",
        icon: RefreshRight,
        onClick: () => handleSync(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getVerifyListPage({
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

  /** 申报（草稿/退单 → 已申报） */
  function handleDeclare(row: VerifyListItem) {
    ElMessageBox.confirm(
      $t("customs.verify.confirmDeclare", { no: row.listNo }),
      $t("customs.verify.declareTitle"),
      { type: "warning" }
    ).then(() => {
      declareVerifyList(row.id).then(() => {
        message($t("customs.verify.declaredTip", { no: row.listNo }), {
          type: "success"
        });
        onSearch();
      });
    });
  }

  /** 同步海关回执（已申报→审核通过→已核扣） */
  function handleSync(row: VerifyListItem) {
    syncVerifyReceipt(row.id).then(() => {
      message($t("customs.verify.syncedTip", { no: row.listNo }), {
        type: "success"
      });
      onSearch();
    });
  }

  /** 详情抽屉 */
  function openDetail(row: VerifyListItem) {
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
    handleDeclare,
    handleSync,
    openDetail,
    handleSizeChange,
    handleCurrentChange
  };
}

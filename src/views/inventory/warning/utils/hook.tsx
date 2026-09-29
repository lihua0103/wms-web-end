import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getWarningPage, handleWarning } from "@/api/inventory";
import type { WarningItem } from "@/api/inventory";
import {
  warningTypeOptions,
  warningStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import CircleCheck from "~icons/ep/circle-check";

export function useWarning() {
  const form = reactive({
    warningType: "",
    materialCode: "",
    materialName: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<WarningItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("inventory.warning.warningType"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(warningTypeOptions, row.warningType)}>
          {dictLabel(warningTypeOptions, row.warningType)}
        </el-tag>
      )
    },
    {
      label: $t("inventory.warning.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inventory.warning.materialName"),
      prop: "materialName",
      minWidth: 130
    },
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
      label: $t("common.columns.batchNo"),
      prop: "batchNo",
      minWidth: 90
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 80 },
    {
      label: $t("inventory.warning.safetyQty"),
      prop: "safetyQty",
      minWidth: 90
    },
    {
      label: $t("inventory.warning.expiredAt"),
      prop: "expiredAt",
      minWidth: 100
    },
    {
      label: $t("inventory.warning.days"),
      prop: "days",
      minWidth: 90
    },
    {
      label: $t("common.columns.status"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(warningStatusOptions, row.status)}>
          {dictLabel(warningStatusOptions, row.status)}
        </el-tag>
      )
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

  function operationButtons(row: WarningItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "active") {
      buttons.push({
        label: $t("inventory.warning.handle"),
        type: "primary",
        icon: CircleCheck,
        onClick: () => handleHandle(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getWarningPage({
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

  /** 标记处理（可填处理备注） */
  function handleHandle(row: WarningItem) {
    ElMessageBox.prompt(
      $t("inventory.warning.handleTip", {
        code: row.materialCode
      }),
      $t("inventory.warning.tip"),
      {
        confirmButtonText: $t("common.buttons.confirm"),
        cancelButtonText: $t("common.buttons.cancel"),
        inputPlaceholder: $t("inventory.warning.handleRemarkPh"),
        inputValidator: () => true
      }
    ).then(({ value }) => {
      handleWarning(row.id, value).then(() => {
        message($t("inventory.warning.handled"), { type: "success" });
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
    warningTypeOptions,
    warningStatusOptions,
    onSearch,
    resetForm,
    handleHandle,
    handleSizeChange,
    handleCurrentChange
  };
}

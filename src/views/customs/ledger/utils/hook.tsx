import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { $t } from "@/plugins/i18n";
import {
  getLedgerPage,
  addLedger,
  updateLedger,
  deleteLedger
} from "@/api/customs";
import type { CustomsLedgerItem } from "@/api/customs";
import {
  dictLabel,
  dictTag,
  customsLedgerTypeOptions,
  customsLedgerStatusOptions,
  supervisionModeOptions
} from "@/constants/wms";
import View from "~icons/ep/view";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

export function useCustomsLedger() {
  const form = reactive({
    ledgerNo: "",
    enterpriseName: "",
    ledgerType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<CustomsLedgerItem[]>([]);

  /** 详情抽屉 */
  const detailVisible = ref(false);
  const currentRow = ref<CustomsLedgerItem | null>(null);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("customs.ledger.ledgerNo"), prop: "ledgerNo", minWidth: 140 },
    {
      label: $t("customs.ledger.ledgerType"),
      minWidth: 120,
      cellRenderer: ({ row }) =>
        dictLabel(customsLedgerTypeOptions, row.ledgerType)
    },
    {
      label: $t("customs.ledger.enterpriseName"),
      prop: "enterpriseName",
      minWidth: 160
    },
    {
      label: $t("customs.ledger.customsCode"),
      prop: "customsCode",
      minWidth: 120
    },
    {
      label: $t("customs.ledger.supervisionMode"),
      minWidth: 150,
      cellRenderer: ({ row }) =>
        dictLabel(supervisionModeOptions, row.supervisionMode)
    },
    { label: $t("customs.ledger.validFrom"), prop: "validFrom", minWidth: 110 },
    { label: $t("customs.ledger.validTo"), prop: "validTo", minWidth: 110 },
    {
      label: $t("common.columns.status"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(customsLedgerStatusOptions, row.status)}>
          {dictLabel(customsLedgerStatusOptions, row.status)}
        </el-tag>
      )
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

  function operationButtons(row: CustomsLedgerItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("customs.ledger.detailBtn"),
        icon: View,
        onClick: () => openDetail(row)
      },
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("customs.ledger.editTitle"), row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      }
    ];
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getLedgerPage({
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

  /** 新增/编辑账册弹窗 */
  function openDialog(title: string, row?: CustomsLedgerItem) {
    addDialog({
      title,
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          ledgerNo: row?.ledgerNo ?? "",
          ledgerType: row?.ledgerType ?? "bonded_logistics",
          enterpriseName: row?.enterpriseName ?? "",
          customsCode: row?.customsCode ?? "",
          creditCode: row?.creditCode ?? "",
          supervisionMode: row?.supervisionMode ?? "1233",
          validFrom: row?.validFrom ?? "",
          validTo: row?.validTo ?? "",
          status: row?.status ?? "active",
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<CustomsLedgerItem> }
        ).formInline;
        const req = formInline.id
          ? updateLedger(formInline)
          : addLedger(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("customs.ledger.updateSuccess")
              : $t("customs.ledger.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  /** 底账明细抽屉 */
  function openDetail(row: CustomsLedgerItem) {
    currentRow.value = row;
    detailVisible.value = true;
  }

  function handleDelete(row: CustomsLedgerItem) {
    ElMessageBox.confirm(
      $t("customs.ledger.confirmDelete", { no: row.ledgerNo }),
      $t("customs.ledger.tip"),
      { type: "warning" }
    ).then(() => {
      deleteLedger([row.id]).then(() => {
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
    openDialog,
    openDetail,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

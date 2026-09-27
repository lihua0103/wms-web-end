import { reactive, ref, onMounted } from "vue";
import { $t } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { message } from "@/utils/message";
import { getQcPage, submitQc } from "@/api/inbound";
import type { QcItem } from "@/api/inbound";
import { qcResultOptions, dictTag, dictLabel } from "@/constants/wms";
import EditPen from "~icons/ep/edit-pen";
import formComp from "../form.vue";

export function useQc() {
  const form = reactive({
    code: "",
    receiptCode: "",
    materialCode: "",
    qcResult: ""
  });
  const loading = ref(false);
  const dataList = ref<QcItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("inbound.qc.qcNo"), prop: "code", minWidth: 130 },
    { label: $t("inbound.qc.receiptNo"), prop: "receiptCode", minWidth: 130 },
    {
      label: $t("inbound.qc.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inbound.qc.materialName"),
      prop: "materialName",
      minWidth: 120
    },
    { label: $t("inbound.qc.batch"), prop: "batchNo", minWidth: 80 },
    { label: $t("inbound.qc.qcQty"), prop: "qcQty", minWidth: 80 },
    {
      label: $t("inbound.qc.qcResult"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(qcResultOptions, row.qcResult)}>
          {dictLabel(qcResultOptions, row.qcResult)}
        </el-tag>
      )
    },
    { label: $t("inbound.qc.qcUser"), prop: "qcUser", minWidth: 70 },
    { label: $t("inbound.qc.qcTime"), prop: "createdAt", minWidth: 140 },
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

  function operationButtons(row: QcItem): TableOperationButton[] {
    return [
      {
        label: $t(
          row.qcResult === "waiting"
            ? "inbound.qc.enterResult"
            : "inbound.qc.editResult"
        ),
        icon: EditPen,
        onClick: () => openSubmitDialog(row)
      }
    ];
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getQcPage({
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

  /** 录入质检结果 */
  function openSubmitDialog(row: QcItem) {
    addDialog({
      title: $t("inbound.qc.enterTitle"),
      width: "36%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row.id,
          code: row.code,
          qcResult: row.qcResult === "waiting" ? "pass" : row.qcResult,
          qcRemark: row.qcRemark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as {
            formInline: { id: number; qcResult: string; qcRemark: string };
          }
        ).formInline;
        submitQc(formInline).then(() => {
          message($t("inbound.qc.submitSuccess"), { type: "success" });
          done();
          onSearch();
        });
      }
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
    qcResultOptions,
    onSearch,
    resetForm,
    openSubmitDialog,
    handleSizeChange,
    handleCurrentChange
  };
}

import { reactive, ref, onMounted } from "vue";
import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";
import { getQcPage, submitQc } from "@/api/inbound";
import type { QcItem } from "@/api/inbound";
import { qcResultOptions, dictTag, dictLabel } from "@/constants/wms";
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
    { label: "质检单号", prop: "code", minWidth: 130 },
    { label: "收货单号", prop: "receiptCode", minWidth: 130 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 120 },
    { label: "批次", prop: "batchNo", minWidth: 80 },
    { label: "质检数量", prop: "qcQty", minWidth: 80 },
    {
      label: "质检结果",
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(qcResultOptions, row.qcResult)}>
          {dictLabel(qcResultOptions, row.qcResult)}
        </el-tag>
      )
    },
    { label: "质检员", prop: "qcUser", minWidth: 70 },
    { label: "质检时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 100, slot: "operation" }
  ];

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
      title: "录入质检结果",
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
          message("质检结果已提交", { type: "success" });
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

import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getCrossdockPage, executeCrossdock } from "@/api/operation";
import type { CrossdockItem } from "@/api/operation";
import { docStatusOptions, dictTag } from "@/constants/wms";
import VideoPlay from "~icons/ep/video-play";

export function useCrossdock() {
  const statusMap: Record<string, string> = {
    pending: $t("operation.crossdock.statusPending"),
    processing: $t("operation.crossdock.statusProcessing"),
    finished: $t("operation.crossdock.statusFinished"),
    cancelled: $t("operation.crossdock.statusCancelled")
  };

  const form = reactive({
    code: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<CrossdockItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("operation.crossdock.code"), prop: "code", minWidth: 130 },
    {
      label: $t("operation.crossdock.asnCode"),
      prop: "asnCode",
      minWidth: 130
    },
    {
      label: $t("operation.crossdock.outboundCode"),
      prop: "outboundCode",
      minWidth: 130
    },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    {
      label: $t("operation.crossdock.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("operation.crossdock.materialName"),
      prop: "materialName",
      minWidth: 120
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 70 },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(docStatusOptions, row.status)}>
          {statusMap[row.status] || row.status}
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

  function operationButtons(row: CrossdockItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "pending") {
      buttons.push({
        label: $t("common.buttons.execute"),
        icon: VideoPlay,
        onClick: () => handleExecute(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getCrossdockPage({
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

  /** 执行越库 */
  function handleExecute(row: CrossdockItem) {
    ElMessageBox.confirm(
      $t("operation.crossdock.executeConfirm", { code: row.code }),
      $t("operation.crossdock.tip"),
      { type: "warning" }
    ).then(() => {
      executeCrossdock(row.id).then(() => {
        message($t("operation.crossdock.executeSuccess"), { type: "success" });
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
    statusMap,
    onSearch,
    resetForm,
    handleExecute,
    handleSizeChange,
    handleCurrentChange
  };
}

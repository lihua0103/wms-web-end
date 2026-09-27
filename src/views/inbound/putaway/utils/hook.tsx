import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { $t } from "@/plugins/i18n";
import { message } from "@/utils/message";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getPutawayPage, finishPutaway } from "@/api/inbound";
import type { PutawayTaskItem } from "@/api/inbound";
import { taskStatusOptions, dictTag, dictLabel } from "@/constants/wms";
import CircleCheck from "~icons/ep/circle-check";

export function usePutaway() {
  const form = reactive({
    taskNo: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<PutawayTaskItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("inbound.putaway.taskNo"), prop: "taskNo", minWidth: 130 },
    {
      label: $t("inbound.putaway.receiptNo"),
      prop: "receiptCode",
      minWidth: 130
    },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    {
      label: $t("inbound.putaway.fromLocation"),
      prop: "fromLocation",
      minWidth: 90
    },
    {
      label: $t("inbound.putaway.toLocation"),
      prop: "toLocation",
      minWidth: 90
    },
    {
      label: $t("inbound.putaway.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inbound.putaway.materialName"),
      prop: "materialName",
      minWidth: 120
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 70 },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(taskStatusOptions, row.status)}>
          {dictLabel(taskStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: $t("inbound.putaway.operator"), prop: "operator", minWidth: 70 },
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

  function operationButtons(row: PutawayTaskItem): TableOperationButton[] {
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
      const { data } = await getPutawayPage({
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

  function handleFinish(row: PutawayTaskItem) {
    ElMessageBox.confirm(
      $t("inbound.putaway.confirmFinish", {
        taskNo: row.taskNo,
        location: row.toLocation
      }),
      $t("inbound.putaway.tip"),
      { type: "warning" }
    ).then(() => {
      finishPutaway(row.id).then(() => {
        message($t("inbound.putaway.finishSuccess"), { type: "success" });
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
    onSearch,
    resetForm,
    handleFinish,
    handleSizeChange,
    handleCurrentChange
  };
}

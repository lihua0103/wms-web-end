import { reactive, ref, onMounted } from "vue";
import { getLogPage } from "@/api/system";
import type { LogItem } from "@/api/system";
import type { DictItem } from "@/constants/wms";
import { dictLabel, dictTag } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import View from "~icons/ep/view";

/** 执行结果选项 */
export const logStatusOptions: DictItem[] = [
  { label: $t("system.log.success"), value: 1, tag: "success" },
  { label: $t("system.log.failure"), value: 0, tag: "danger" }
];

export function useLog() {
  const form = reactive({
    keyword: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<LogItem[]>([]);
  const detailVisible = ref(false);
  const currentRow = ref<LogItem>();

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("system.log.operator"), prop: "username", minWidth: 90 },
    { label: $t("system.log.module"), prop: "module", minWidth: 100 },
    { label: $t("system.log.action"), prop: "action", minWidth: 80 },
    { label: $t("system.log.ip"), prop: "ip", minWidth: 120 },
    {
      label: $t("system.log.result"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(logStatusOptions, row.status)}>
          {dictLabel(logStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("system.log.durationMs"),
      prop: "duration",
      minWidth: 80
    },
    { label: $t("system.log.time"), prop: "createdAt", minWidth: 140 },
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

  function operationButtons(row: LogItem): TableOperationButton[] {
    return [
      {
        label: $t("common.buttons.detail"),
        icon: View,
        onClick: () => openDetail(row)
      }
    ];
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getLogPage({
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

  function openDetail(row: LogItem) {
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
    openDetail,
    handleSizeChange,
    handleCurrentChange
  };
}

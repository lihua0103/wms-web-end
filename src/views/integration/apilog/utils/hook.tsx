import { reactive, ref, onMounted } from "vue";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getApiLogPage } from "@/api/integration";
import type { ApiLogItem } from "@/api/integration";
import {
  apiDirectionOptions,
  apiLogStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import View from "~icons/ep/view";

export function useApiLog() {
  const form = reactive({
    requestId: "",
    systemName: "",
    apiPath: "",
    direction: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ApiLogItem[]>([]);
  const detailVisible = ref(false);
  const currentRow = ref<ApiLogItem>();

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("integration.apiLog.requestId"),
      prop: "requestId",
      minWidth: 140
    },
    {
      label: $t("integration.apiLog.systemName"),
      prop: "systemName",
      minWidth: 110
    },
    {
      label: $t("integration.apiLog.apiPath"),
      prop: "apiPath",
      minWidth: 140
    },
    {
      label: $t("integration.apiLog.direction"),
      minWidth: 130,
      cellRenderer: ({ row }) => dictLabel(apiDirectionOptions, row.direction)
    },
    {
      label: $t("integration.apiLog.durationCol"),
      prop: "duration",
      minWidth: 80
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(apiLogStatusOptions, row.status)}>
          {dictLabel(apiLogStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("integration.apiLog.errorMsg"),
      prop: "errorMsg",
      minWidth: 190
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

  function operationButtons(row: ApiLogItem): TableOperationButton[] {
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
      const { data } = await getApiLogPage({
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

  function openDetail(row: ApiLogItem) {
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

import { reactive, ref, onMounted } from "vue";
import { getApiLogPage } from "@/api/integration";
import type { ApiLogItem } from "@/api/integration";
import {
  apiDirectionOptions,
  apiLogStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";

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
    { label: "请求 ID", prop: "requestId", minWidth: 140 },
    { label: "系统名称", prop: "systemName", minWidth: 110 },
    { label: "接口路径", prop: "apiPath", minWidth: 140 },
    {
      label: "方向",
      minWidth: 130,
      cellRenderer: ({ row }) => dictLabel(apiDirectionOptions, row.direction)
    },
    { label: "耗时(ms)", prop: "duration", minWidth: 80 },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(apiLogStatusOptions, row.status)}>
          {dictLabel(apiLogStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "错误信息", prop: "errorMsg", minWidth: 190 },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 90, slot: "operation" }
  ];

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

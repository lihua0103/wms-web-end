import { reactive, ref, onMounted } from "vue";
import { getLogPage } from "@/api/system";
import type { LogItem } from "@/api/system";
import type { DictItem } from "@/constants/wms";
import { dictLabel, dictTag } from "@/constants/wms";

/** 执行结果选项 */
export const logStatusOptions: DictItem[] = [
  { label: "成功", value: 1, tag: "success" },
  { label: "失败", value: 0, tag: "danger" }
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
    { label: "操作人", prop: "username", minWidth: 90 },
    { label: "模块", prop: "module", minWidth: 100 },
    { label: "操作", prop: "action", minWidth: 80 },
    { label: "IP 地址", prop: "ip", minWidth: 120 },
    {
      label: "执行结果",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(logStatusOptions, row.status)}>
          {dictLabel(logStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: "耗时(ms)",
      prop: "duration",
      minWidth: 80
    },
    { label: "操作时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 90, slot: "operation" }
  ];

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

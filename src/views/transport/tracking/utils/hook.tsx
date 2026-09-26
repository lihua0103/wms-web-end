import { reactive, ref, onMounted } from "vue";
import { getTrackingPage } from "@/api/transport";
import type { TrackingItem } from "@/api/transport";
import { deliveryStatusOptions, dictTag, dictLabel } from "@/constants/wms";

export function useTracking() {
  const form = reactive({
    code: "",
    vehicleNo: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<TrackingItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "配送单号", prop: "code", minWidth: 130 },
    { label: "承运商", prop: "carrierName", minWidth: 90 },
    { label: "车牌号", prop: "vehicleNo", minWidth: 90 },
    { label: "司机", prop: "driverName", minWidth: 70 },
    { label: "起点", prop: "fromCity", minWidth: 60 },
    { label: "终点", prop: "toCity", minWidth: 60 },
    { label: "当前位置", prop: "currentLocation", minWidth: 120 },
    {
      label: "运输进度",
      minWidth: 140,
      cellRenderer: ({ row }) => (
        <el-progress
          percentage={row.progress}
          status={row.progress >= 100 ? "success" : undefined}
          stroke-width={10}
        />
      )
    },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(deliveryStatusOptions, row.status)}>
          {dictLabel(deliveryStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "更新时间", prop: "updatedAt", minWidth: 140 }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getTrackingPage({
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
    handleSizeChange,
    handleCurrentChange
  };
}

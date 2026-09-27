import { reactive, ref, onMounted } from "vue";
import { $t } from "@/plugins/i18n";
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
    { label: $t("transport.tracking.deliveryNo"), prop: "code", minWidth: 130 },
    {
      label: $t("transport.tracking.carrier"),
      prop: "carrierName",
      minWidth: 90
    },
    {
      label: $t("transport.tracking.licensePlate"),
      prop: "vehicleNo",
      minWidth: 90
    },
    {
      label: $t("transport.tracking.driver"),
      prop: "driverName",
      minWidth: 70
    },
    { label: $t("transport.tracking.origin"), prop: "fromCity", minWidth: 60 },
    {
      label: $t("transport.tracking.destination"),
      prop: "toCity",
      minWidth: 60
    },
    {
      label: $t("transport.tracking.currentLocation"),
      prop: "currentLocation",
      minWidth: 120
    },
    {
      label: $t("transport.tracking.progress"),
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
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(deliveryStatusOptions, row.status)}>
          {dictLabel(deliveryStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: $t("common.columns.updateTime"), prop: "updatedAt", minWidth: 140 }
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

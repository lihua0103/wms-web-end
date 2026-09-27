import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { $t } from "@/plugins/i18n";
import { message } from "@/utils/message";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getShippingPage, confirmShipping } from "@/api/outbound";
import type { ShippingItem } from "@/api/outbound";
import Van from "~icons/ep/van";

export function useShipping() {
  const statusMap: Record<string, { label: string; tag: string }> = {
    waiting: { label: $t("outbound.shipping.statusWaiting"), tag: "warning" },
    shipped: { label: $t("outbound.shipping.statusShipped"), tag: "success" },
    finished: { label: $t("outbound.shipping.statusFinished"), tag: "success" }
  };

  const form = reactive({
    code: "",
    carrierName: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ShippingItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("outbound.shipping.code"), prop: "code", minWidth: 130 },
    {
      label: $t("outbound.shipping.orderNo"),
      prop: "orderCode",
      minWidth: 130
    },
    {
      label: $t("outbound.shipping.carrier"),
      prop: "carrierName",
      minWidth: 90
    },
    {
      label: $t("outbound.shipping.vehicleNo"),
      prop: "vehicleNo",
      minWidth: 90
    },
    { label: $t("outbound.shipping.driver"), prop: "driverName", minWidth: 70 },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 70 },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={statusMap[row.status]?.tag || "info"}>
          {statusMap[row.status]?.label || row.status}
        </el-tag>
      )
    },
    { label: $t("outbound.shipping.shipDate"), prop: "shipDate", minWidth: 90 },
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

  function operationButtons(row: ShippingItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "waiting") {
      buttons.push({
        label: $t("outbound.shipping.confirmShip"),
        icon: Van,
        onClick: () => handleConfirm(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getShippingPage({
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

  function handleConfirm(row: ShippingItem) {
    ElMessageBox.confirm(
      $t("outbound.shipping.confirmTip", {
        code: row.code,
        carrier: row.carrierName,
        vehicle: row.vehicleNo
      }),
      $t("outbound.shipping.tip"),
      { type: "warning" }
    ).then(() => {
      confirmShipping(row.id).then(() => {
        message($t("outbound.shipping.confirmSuccess"), { type: "success" });
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
    handleConfirm,
    handleSizeChange,
    handleCurrentChange
  };
}

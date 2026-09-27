import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getDispatchPage, assignDispatch, signDispatch } from "@/api/transport";
import type { DispatchItem } from "@/api/transport";
import { deliveryStatusOptions, dictTag } from "@/constants/wms";
import Van from "~icons/ep/van";
import CircleCheck from "~icons/ep/circle-check";
import formComp from "../form.vue";

export function useDispatch() {
  const form = reactive({
    code: "",
    customerName: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<DispatchItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("transport.dispatch.deliveryNo"), prop: "code", minWidth: 130 },
    {
      label: $t("transport.dispatch.outboundNo"),
      prop: "orderCode",
      minWidth: 130
    },
    {
      label: $t("transport.dispatch.customer"),
      prop: "customerName",
      minWidth: 120
    },
    { label: $t("transport.dispatch.address"), prop: "address", minWidth: 130 },
    {
      label: $t("transport.dispatch.carrier"),
      prop: "carrierName",
      minWidth: 90
    },
    {
      label: $t("transport.dispatch.licensePlate"),
      prop: "vehicleNo",
      minWidth: 90
    },
    {
      label: $t("transport.dispatch.driver"),
      prop: "driverName",
      minWidth: 70
    },
    { label: $t("common.columns.quantity"), prop: "qty", minWidth: 60 },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(deliveryStatusOptions, row.status)}>
          {deliveryStatusOptions.find(d => d.value === row.status)?.label ||
            row.status}
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

  function operationButtons(row: DispatchItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (["pending"].includes(row.status)) {
      buttons.push({
        label: $t("common.buttons.dispatch"),
        icon: Van,
        onClick: () => openAssignDialog(row)
      });
    }
    if (["dispatched", "delivering"].includes(row.status)) {
      buttons.push({
        label: $t("transport.dispatch.sign"),
        type: "success",
        icon: CircleCheck,
        onClick: () => handleSign(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getDispatchPage({
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

  /** 调度：指定承运商/车辆/司机 */
  function openAssignDialog(row: DispatchItem) {
    addDialog({
      title: $t("transport.dispatch.assignTitle"),
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row.id,
          code: row.code,
          carrierName: row.carrierName ?? "",
          vehicleNo: row.vehicleNo ?? "",
          driverName: row.driverName ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as {
            formInline: {
              id: number;
              carrierName: string;
              vehicleNo: string;
              driverName: string;
            };
          }
        ).formInline;
        assignDispatch(formInline).then(() => {
          message($t("transport.dispatch.dispatchSuccess"), {
            type: "success"
          });
          done();
          onSearch();
        });
      }
    });
  }

  /** 签收 */
  function handleSign(row: DispatchItem) {
    ElMessageBox.confirm(
      $t("transport.dispatch.confirmSign", { code: row.code }),
      $t("transport.dispatch.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      signDispatch(row.id).then(() => {
        message($t("transport.dispatch.signSuccess"), { type: "success" });
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
    openAssignDialog,
    handleSign,
    handleSizeChange,
    handleCurrentChange
  };
}

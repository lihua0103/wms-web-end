import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getReleasePassPage,
  declareReleasePass,
  releasePass,
  crossReleasePass,
  cancelReleasePass
} from "@/api/customs";
import type { ReleasePassItem } from "@/api/customs";
import {
  dictLabel,
  dictTag,
  releaseDirectionOptions,
  releaseStatusOptions
} from "@/constants/wms";
import View from "~icons/ep/view";
import Position from "~icons/ep/position";
import CircleCheck from "~icons/ep/circle-check";
import Van from "~icons/ep/van";
import CircleClose from "~icons/ep/circle-close";

export function useCustomsRelease() {
  const form = reactive({
    passNo: "",
    vehicleNo: "",
    direction: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ReleasePassItem[]>([]);

  /** 详情抽屉 */
  const detailVisible = ref(false);
  const currentRow = ref<ReleasePassItem | null>(null);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("customs.release.passNo"), prop: "passNo", minWidth: 140 },
    {
      label: $t("customs.release.direction"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(releaseDirectionOptions, row.direction)}>
          {dictLabel(releaseDirectionOptions, row.direction)}
        </el-tag>
      )
    },
    {
      label: $t("customs.release.vehicleNo"),
      prop: "vehicleNo",
      minWidth: 100
    },
    { label: $t("customs.release.driver"), prop: "driverName", minWidth: 80 },
    { label: $t("customs.release.relListNo"), prop: "listNo", minWidth: 140 },
    { label: $t("customs.release.relBizNo"), prop: "bizNo", minWidth: 130 },
    { label: $t("customs.release.packCount"), prop: "packCount", minWidth: 80 },
    {
      label: $t("customs.release.grossWeightKg"),
      prop: "grossWeight",
      minWidth: 90
    },
    {
      label: $t("common.columns.status"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(releaseStatusOptions, row.status)}>
          {dictLabel(releaseStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("customs.release.declareTime"),
      prop: "declareTime",
      minWidth: 140
    },
    {
      label: $t("customs.release.releaseTime"),
      prop: "releaseTime",
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

  function operationButtons(row: ReleasePassItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.detail"),
        icon: View,
        onClick: () => openDetail(row)
      }
    ];
    if (row.status === "draft") {
      buttons.push({
        label: $t("common.buttons.declare"),
        type: "warning",
        icon: Position,
        onClick: () => handleDeclare(row)
      });
    }
    if (row.status === "declared") {
      buttons.push({
        label: $t("customs.release.releaseBtn"),
        type: "success",
        icon: CircleCheck,
        onClick: () => handleRelease(row)
      });
    }
    if (row.status === "released") {
      buttons.push({
        label: $t("customs.release.crossBtn"),
        type: "success",
        icon: Van,
        onClick: () => handleCross(row)
      });
    }
    if (row.status === "draft" || row.status === "declared") {
      buttons.push({
        label: $t("customs.release.cancelBtn"),
        type: "danger",
        icon: CircleClose,
        onClick: () => handleCancel(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getReleasePassPage({
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

  /** 申报（待申报 → 已申报） */
  function handleDeclare(row: ReleasePassItem) {
    ElMessageBox.confirm(
      $t("customs.release.confirmDeclare", {
        no: row.passNo,
        vehicle: row.vehicleNo
      }),
      $t("customs.release.declareTitle"),
      { type: "warning" }
    ).then(() => {
      declareReleasePass(row.id).then(() => {
        message($t("customs.release.declaredTip", { no: row.passNo }), {
          type: "success"
        });
        onSearch();
      });
    });
  }

  /** 放行回执（已申报 → 已放行） */
  function handleRelease(row: ReleasePassItem) {
    releasePass(row.id).then(() => {
      message($t("customs.release.releasedTip", { no: row.passNo }), {
        type: "success"
      });
      onSearch();
    });
  }

  /** 过卡确认（已放行 → 已过卡） */
  function handleCross(row: ReleasePassItem) {
    crossReleasePass(row.id).then(() => {
      message($t("customs.release.crossedTip", { vehicle: row.vehicleNo }), {
        type: "success"
      });
      onSearch();
    });
  }

  /** 作废 */
  function handleCancel(row: ReleasePassItem) {
    ElMessageBox.confirm(
      $t("customs.release.confirmCancel", { no: row.passNo }),
      $t("customs.release.tip"),
      { type: "warning" }
    ).then(() => {
      cancelReleasePass(row.id).then(() => {
        message($t("customs.release.cancelledTip"), { type: "success" });
        onSearch();
      });
    });
  }

  /** 详情抽屉 */
  function openDetail(row: ReleasePassItem) {
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
    handleDeclare,
    handleRelease,
    handleCross,
    handleCancel,
    openDetail,
    handleSizeChange,
    handleCurrentChange
  };
}

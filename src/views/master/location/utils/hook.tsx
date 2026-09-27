import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { $t } from "@/plugins/i18n";
import {
  getLocationPage,
  addLocation,
  updateLocation,
  deleteLocation,
  generateLocations
} from "@/api/master";
import type { LocationItem } from "@/api/master";
import { locationTypeOptions, dictLabel } from "@/constants/wms";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";
import genForm from "../gen-form.vue";

export function useLocation() {
  const statusMap: Record<string, { label: string; tag: string }> = {
    idle: { label: $t("master.location.statusIdle"), tag: "success" },
    occupied: { label: $t("master.location.statusOccupied"), tag: "primary" },
    disabled: { label: $t("master.location.statusDisabled"), tag: "danger" }
  };

  const form = reactive({
    code: "",
    warehouseCode: "",
    locationType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<LocationItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("master.location.code"), prop: "code", minWidth: 140 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    { label: $t("common.columns.zone"), prop: "zoneCode", minWidth: 80 },
    {
      label: $t("master.location.type"),
      minWidth: 90,
      cellRenderer: ({ row }) =>
        dictLabel(locationTypeOptions, row.locationType)
    },
    {
      label: $t("master.location.maxWeight"),
      prop: "maxWeight",
      minWidth: 100
    },
    {
      label: $t("master.location.maxVolume"),
      prop: "maxVolume",
      minWidth: 100
    },
    {
      label: $t("master.location.colMix"),
      minWidth: 60,
      cellRenderer: ({ row }) =>
        row.isMix ? $t("master.location.allow") : $t("master.location.forbid")
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={statusMap[row.status]?.tag || "info"}>
          {statusMap[row.status]?.label || row.status}
        </el-tag>
      )
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

  function operationButtons(row: LocationItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("master.location.editTitle"), row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      }
    ];
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getLocationPage({
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

  function openDialog(title: string, row?: LocationItem) {
    addDialog({
      title,
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          warehouseCode: row?.warehouseCode ?? "WH001",
          zoneCode: row?.zoneCode ?? "",
          code: row?.code ?? "",
          locationType: row?.locationType ?? "shelf",
          maxWeight: row?.maxWeight ?? 1000,
          maxVolume: row?.maxVolume ?? 1,
          isMix: row?.isMix ?? 0,
          status: row?.status ?? "idle"
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<LocationItem> }
        ).formInline;
        const req = formInline.id
          ? updateLocation(formInline)
          : addLocation(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("master.location.editSuccess")
              : $t("master.location.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  /** 批量生成库位 */
  function openGenDialog() {
    addDialog({
      title: $t("master.location.genTitle"),
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: genForm,
      props: {
        formInline: {
          warehouseCode: "WH001",
          zoneCode: "",
          prefix: "1Z01",
          row: 5,
          col: 5,
          floor: 3
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as {
            formInline: {
              warehouseCode: string;
              zoneCode: string;
              prefix: string;
              row: number;
              col: number;
              floor: number;
            };
          }
        ).formInline;
        generateLocations(formInline).then(res => {
          message(
            res.msg || $t("master.location.genSuccess", { count: res.data }),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: LocationItem) {
    ElMessageBox.confirm(
      $t("master.location.delTip", { code: row.code }),
      $t("master.location.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteLocation([row.id]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
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
    openDialog,
    openGenDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { $t } from "@/plugins/i18n";
import { getZonePage, addZone, updateZone, deleteZone } from "@/api/master";
import type { ZoneItem } from "@/api/master";
import { zoneTypeOptions, dictLabel } from "@/constants/wms";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

export function useZone() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    zoneType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ZoneItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("master.zone.code"), prop: "code", minWidth: 100 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 90
    },
    { label: $t("master.zone.name"), prop: "name", minWidth: 120 },
    {
      label: $t("master.zone.type"),
      minWidth: 100,
      cellRenderer: ({ row }) => dictLabel(zoneTypeOptions, row.zoneType)
    },
    {
      label: $t("master.zone.locationCount"),
      prop: "locationCount",
      minWidth: 70
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1
            ? $t("master.zone.enabled")
            : $t("master.zone.disabled")}
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

  function operationButtons(row: ZoneItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("master.zone.editTitle"), row)
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
      const { data } = await getZonePage({
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

  function openDialog(title: string, row?: ZoneItem) {
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
          code: row?.code ?? "",
          name: row?.name ?? "",
          zoneType: row?.zoneType ?? "storage",
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (options.props as { formInline: Partial<ZoneItem> })
          .formInline;
        const req = formInline.id
          ? updateZone(formInline)
          : addZone(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("master.zone.editSuccess")
              : $t("master.zone.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: ZoneItem) {
    ElMessageBox.confirm(
      $t("master.zone.delTip", { name: row.name }),
      $t("master.zone.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteZone([row.id]).then(() => {
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
    zoneTypeOptions,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

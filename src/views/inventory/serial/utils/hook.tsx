import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getSerialPage,
  addSerial,
  updateSerial,
  deleteSerial,
  scrapSerial
} from "@/api/inventory";
import type { SerialItem } from "@/api/inventory";
import { serialStatusOptions, dictLabel, dictTag } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import View from "~icons/ep/view";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Box from "~icons/ep/box";
import formComp from "../form.vue";

export function useSerial() {
  const form = reactive({
    serialNo: "",
    materialCode: "",
    materialName: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<SerialItem[]>([]);
  const detailVisible = ref(false);
  const currentRow = ref<SerialItem>();

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("inventory.serial.serialNo"),
      prop: "serialNo",
      minWidth: 150
    },
    {
      label: $t("inventory.serial.materialCode"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("inventory.serial.materialName"),
      prop: "materialName",
      minWidth: 130
    },
    { label: $t("inventory.serial.batch"), prop: "batchNo", minWidth: 90 },
    {
      label: $t("common.columns.status"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(serialStatusOptions, row.status)}>
          {dictLabel(serialStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 90
    },
    {
      label: $t("common.columns.location"),
      prop: "locationCode",
      minWidth: 90
    },
    {
      label: $t("inventory.serial.inboundDate"),
      prop: "inboundDate",
      minWidth: 100
    },
    {
      label: $t("inventory.serial.outboundDate"),
      prop: "outboundDate",
      minWidth: 100
    },
    {
      label: $t("inventory.serial.orderNo"),
      prop: "orderNo",
      minWidth: 120
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

  function operationButtons(row: SerialItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.detail"),
        icon: View,
        onClick: () => openDetail(row)
      }
    ];
    if (row.status === "instock") {
      buttons.push(
        {
          label: $t("common.buttons.edit"),
          icon: EditPen,
          onClick: () => openDialog($t("inventory.serial.editTitle"), row)
        },
        {
          label: $t("common.buttons.delete"),
          type: "danger",
          icon: Delete,
          onClick: () => handleDelete(row)
        }
      );
    }
    if (row.status === "instock" || row.status === "repairing") {
      buttons.push({
        label: $t("inventory.serial.scrap"),
        type: "warning",
        icon: Box,
        onClick: () => handleScrap(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getSerialPage({
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

  function openDetail(row: SerialItem) {
    currentRow.value = row;
    detailVisible.value = true;
  }

  function openDialog(title: string, row?: SerialItem) {
    addDialog({
      title,
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          serialNo: row?.serialNo ?? "",
          materialCode: row?.materialCode ?? "",
          materialName: row?.materialName ?? "",
          batchNo: row?.batchNo ?? "",
          warehouseCode: row?.warehouseCode ?? "WH001",
          locationCode: row?.locationCode ?? "",
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<SerialItem> }
        ).formInline;
        const req = formInline.id
          ? updateSerial(formInline)
          : addSerial(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("inventory.serial.editSuccess")
              : $t("inventory.serial.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: SerialItem) {
    ElMessageBox.confirm(
      $t("inventory.serial.delTip", { serialNo: row.serialNo }),
      $t("inventory.serial.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteSerial([row.id]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
        onSearch();
      });
    });
  }

  function handleScrap(row: SerialItem) {
    ElMessageBox.confirm(
      $t("inventory.serial.scrapTip", { serialNo: row.serialNo }),
      $t("inventory.serial.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      scrapSerial([row.id]).then(() => {
        message($t("inventory.serial.scrapped"), { type: "success" });
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
    detailVisible,
    currentRow,
    serialStatusOptions,
    onSearch,
    resetForm,
    openDetail,
    openDialog,
    handleDelete,
    handleScrap,
    handleSizeChange,
    handleCurrentChange
  };
}

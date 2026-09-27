import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getDictTypePage,
  addDictType,
  updateDictType,
  deleteDictType,
  getDictDataList,
  addDictData,
  updateDictData,
  deleteDictData
} from "@/api/system";
import type { DictTypeItem, DictDataItem } from "@/api/system";
import { $t } from "@/plugins/i18n";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";
import dataForm from "../form-data.vue";

export function useDict() {
  // ========================= 左侧：字典类型 =========================

  const typeForm = reactive({
    keyword: ""
  });
  const typeLoading = ref(false);
  const typeList = ref<DictTypeItem[]>([]);
  const selectedType = ref<DictTypeItem>();

  const typePagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const typeColumns: TableColumnList = [
    { label: $t("system.dict.name"), prop: "name", minWidth: 80 },
    { label: $t("system.dict.code"), prop: "code", minWidth: 90 },
    {
      label: $t("system.dict.itemCount"),
      prop: "itemCount",
      minWidth: 60
    },
    {
      fixed: "right",
      label: $t("common.columns.operation"),
      minWidth: 190,
      showOverflowTooltip: false,
      cellRenderer: ({ row }) => (
        <ReTableOperation buttons={typeOperationButtons(row)} />
      )
    }
  ];

  function typeOperationButtons(row: DictTypeItem): TableOperationButton[] {
    return [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openTypeDialog($t("system.dict.editTypeTitle"), row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleTypeDelete(row)
      }
    ];
  }

  async function onTypeSearch() {
    typeLoading.value = true;
    try {
      const { data } = await getDictTypePage({
        page: typePagination.currentPage,
        pageSize: typePagination.pageSize,
        ...typeForm
      });
      typeList.value = data.list;
      typePagination.total = data.total;
      // 当前选中类型被过滤掉时清空右侧
      if (
        selectedType.value &&
        !data.list.some(t => t.id === selectedType.value?.id)
      ) {
        selectedType.value = undefined;
        dataList.value = [];
      }
    } finally {
      typeLoading.value = false;
    }
  }

  function resetTypeForm(formEl: { resetFields: () => void }) {
    formEl.resetFields();
    typePagination.currentPage = 1;
    onTypeSearch();
  }

  function handleTypeSizeChange(val: number) {
    typePagination.pageSize = val;
    onTypeSearch();
  }

  function handleTypeCurrentChange(val: number) {
    typePagination.currentPage = val;
    onTypeSearch();
  }

  /** 新增/编辑字典类型弹窗 */
  function openTypeDialog(title: string, row?: DictTypeItem) {
    addDialog({
      title,
      width: "38%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          name: row?.name ?? "",
          code: row?.code ?? "",
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<DictTypeItem> }
        ).formInline;
        const req = formInline.id
          ? updateDictType(formInline)
          : addDictType(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("system.dict.editSuccess")
              : $t("system.dict.addSuccess"),
            { type: "success" }
          );
          done();
          onTypeSearch();
        });
      }
    });
  }

  function handleTypeDelete(row: DictTypeItem) {
    ElMessageBox.confirm(
      $t("system.dict.deleteTypeConfirm", { name: row.name }),
      $t("system.dict.tip"),
      { type: "warning" }
    ).then(() => {
      deleteDictType([row.id]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
        if (selectedType.value?.id === row.id) {
          selectedType.value = undefined;
          dataList.value = [];
        }
        onTypeSearch();
      });
    });
  }

  // ========================= 右侧：字典数据 =========================

  const dataLoading = ref(false);
  const dataList = ref<DictDataItem[]>([]);

  const dataColumns: TableColumnList = [
    { label: $t("system.dict.label"), prop: "label", minWidth: 80 },
    { label: $t("system.dict.value"), prop: "value", minWidth: 80 },
    { label: $t("system.dict.sort"), prop: "sort", minWidth: 60 },
    {
      label: $t("common.columns.status"),
      minWidth: 60,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1
            ? $t("common.buttons.enabled")
            : $t("common.buttons.disabled")}
        </el-tag>
      )
    },
    { label: $t("common.columns.remark"), prop: "remark", minWidth: 80 },
    {
      fixed: "right",
      label: $t("common.columns.operation"),
      minWidth: 190,
      showOverflowTooltip: false,
      cellRenderer: ({ row }) => (
        <ReTableOperation buttons={dataOperationButtons(row)} />
      )
    }
  ];

  function dataOperationButtons(row: DictDataItem): TableOperationButton[] {
    return [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDataDialog($t("system.dict.editDataTitle"), row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDataDelete(row)
      }
    ];
  }

  /** 点击左侧字典类型行，加载右侧字典数据 */
  async function handleTypeClick(row: DictTypeItem) {
    selectedType.value = row;
    dataLoading.value = true;
    try {
      const { data } = await getDictDataList(row.code);
      dataList.value = data;
    } finally {
      dataLoading.value = false;
    }
  }

  /** 新增/编辑字典数据弹窗 */
  function openDataDialog(title: string, row?: DictDataItem) {
    if (!selectedType.value) {
      message($t("system.dict.selectTypeFirst"), { type: "warning" });
      return;
    }
    addDialog({
      title,
      width: "38%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: dataForm,
      props: {
        formInline: {
          id: row?.id,
          dictCode: selectedType.value.code,
          label: row?.label ?? "",
          value: row?.value ?? "",
          sort: row?.sort ?? 1,
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<DictDataItem> }
        ).formInline;
        const req = formInline.id
          ? updateDictData(formInline)
          : addDictData(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("system.dict.editSuccess")
              : $t("system.dict.addSuccess"),
            { type: "success" }
          );
          done();
          handleTypeClick(selectedType.value!);
        });
      }
    });
  }

  function handleDataDelete(row: DictDataItem) {
    ElMessageBox.confirm(
      $t("system.dict.deleteDataConfirm", { name: row.label }),
      $t("system.dict.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteDictData([row.id]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
        if (selectedType.value) handleTypeClick(selectedType.value);
      });
    });
  }

  onMounted(() => {
    onTypeSearch();
  });

  return {
    // 左侧
    typeForm,
    typeLoading,
    typeList,
    typeColumns,
    typePagination,
    selectedType,
    onTypeSearch,
    resetTypeForm,
    handleTypeSizeChange,
    handleTypeCurrentChange,
    openTypeDialog,
    handleTypeDelete,
    handleTypeClick,
    // 右侧
    dataLoading,
    dataList,
    dataColumns,
    openDataDialog,
    handleDataDelete
  };
}

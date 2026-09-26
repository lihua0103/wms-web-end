import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
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
    { label: "字典名称", prop: "name", minWidth: 80 },
    { label: "字典编码", prop: "code", minWidth: 90 },
    { label: "数据项", prop: "itemCount", minWidth: 60 },
    { fixed: "right", label: "操作", width: 100, slot: "operation" }
  ];

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
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onTypeSearch();
        });
      }
    });
  }

  function handleTypeDelete(row: DictTypeItem) {
    ElMessageBox.confirm(
      `确认删除字典类型「${row.name}」吗？其字典数据将一并失效`,
      "提示",
      { type: "warning" }
    ).then(() => {
      deleteDictType([row.id]).then(() => {
        message("删除成功", { type: "success" });
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
    { label: "数据标签", prop: "label", minWidth: 80 },
    { label: "数据键值", prop: "value", minWidth: 80 },
    { label: "排序", prop: "sort", minWidth: 60 },
    {
      label: "状态",
      minWidth: 60,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
    },
    { label: "备注", prop: "remark", minWidth: 80 },
    { fixed: "right", label: "操作", width: 100, slot: "operation" }
  ];

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
      message("请先在左侧选择字典类型", { type: "warning" });
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
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          handleTypeClick(selectedType.value!);
        });
      }
    });
  }

  function handleDataDelete(row: DictDataItem) {
    ElMessageBox.confirm(`确认删除字典数据「${row.label}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteDictData([row.id]).then(() => {
        message("删除成功", { type: "success" });
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

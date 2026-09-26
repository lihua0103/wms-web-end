import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getMaterialPage,
  addMaterial,
  updateMaterial,
  deleteMaterial
} from "@/api/master";
import type { MaterialItem } from "@/api/master";
import { materialCategoryOptions, dictLabel } from "@/constants/wms";
import formComp from "../form.vue";

export function useMaterial() {
  const form = reactive({
    code: "",
    name: "",
    category: "",
    isSerial: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<MaterialItem[]>([]);
  const detailVisible = ref(false);
  const currentRow = ref<MaterialItem>();

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "物料编码", prop: "code", minWidth: 100 },
    { label: "物料名称", prop: "name", minWidth: 130 },
    {
      label: "分类",
      minWidth: 80,
      cellRenderer: ({ row }) => dictLabel(materialCategoryOptions, row.category)
    },
    { label: "规格", prop: "spec", minWidth: 80 },
    { label: "单位", prop: "unit", minWidth: 60 },
    { label: "条码", prop: "barcode", minWidth: 120 },
    { label: "货主", prop: "ownerName", minWidth: 110 },
    {
      label: "效期管理",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.isExpiry ? "success" : "info"}>
          {row.isExpiry ? "是" : "否"}
        </el-tag>
      )
    },
    {
      label: "序列号管理",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={row.isSerial ? "warning" : "info"}>
          {row.isSerial ? "是" : "否"}
        </el-tag>
      )
    },
    { label: "安全库存", prop: "safetyQty", minWidth: 70 },
    {
      label: "状态",
      minWidth: 60,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
    },
    { fixed: "right", label: "操作", width: 180, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getMaterialPage({
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

  function openDetail(row: MaterialItem) {
    currentRow.value = row;
    detailVisible.value = true;
  }

  function openDialog(title: string, row?: MaterialItem) {
    addDialog({
      title,
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          code: row?.code ?? "",
          name: row?.name ?? "",
          category: row?.category ?? "finished",
          spec: row?.spec ?? "",
          unit: row?.unit ?? "件",
          barcode: row?.barcode ?? "",
          ownerName: row?.ownerName ?? "",
          isExpiry: row?.isExpiry ?? 0,
          isSerial: row?.isSerial ?? 0,
          safetyQty: row?.safetyQty ?? 0,
          price: row?.price ?? 0,
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<MaterialItem> }
        ).formInline;
        const req = formInline.id ? updateMaterial(formInline) : addMaterial(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: MaterialItem) {
    ElMessageBox.confirm(`确认删除物料「${row.name}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteMaterial([row.id]).then(() => {
        message("删除成功", { type: "success" });
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
    materialCategoryOptions,
    onSearch,
    resetForm,
    openDetail,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

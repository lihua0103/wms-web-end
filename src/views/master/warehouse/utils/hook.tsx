import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getWarehousePage,
  addWarehouse,
  updateWarehouse,
  deleteWarehouse
} from "@/api/master";
import type { WarehouseItem } from "@/api/master";
import formComp from "../form.vue";

export function useWarehouse() {
  const form = reactive({
    code: "",
    name: "",
    type: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<WarehouseItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "仓库编码", prop: "code", minWidth: 90 },
    { label: "仓库名称", prop: "name", minWidth: 100 },
    {
      label: "类型",
      minWidth: 70,
      cellRenderer: ({ row }) =>
        ({ normal: "普通", cold: "冷链", dangerous: "危化" })[row.type] || row.type
    },
    { label: "地址", prop: "address", minWidth: 140 },
    { label: "联系人", prop: "contact", minWidth: 70 },
    { label: "电话", prop: "phone", minWidth: 100 },
    {
      label: "面积(㎡)",
      minWidth: 100,
      formatter: row => `${row.areaUsed || 0} / ${row.area || 0}`
    },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
    },
    { fixed: "right", label: "操作", width: 140, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getWarehousePage({
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

  function openDialog(title: string, row?: WarehouseItem) {
    addDialog({
      title,
      width: "42%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          code: row?.code ?? "",
          name: row?.name ?? "",
          address: row?.address ?? "",
          contact: row?.contact ?? "",
          phone: row?.phone ?? "",
          type: row?.type ?? "normal",
          area: row?.area,
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<WarehouseItem> }
        ).formInline;
        const req = formInline.id ? updateWarehouse(formInline) : addWarehouse(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: WarehouseItem) {
    ElMessageBox.confirm(`确认删除仓库「${row.name}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteWarehouse([row.id]).then(() => {
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
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

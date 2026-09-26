import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getOwnerPage, addOwner, updateOwner, deleteOwner } from "@/api/master";
import type { OwnerItem } from "@/api/master";
import formComp from "../form.vue";

export function useOwner() {
  const form = reactive({ code: "", name: "", status: "" });
  const loading = ref(false);
  const dataList = ref<OwnerItem[]>([]);
  const pagination = reactive({ pageSize: 10, currentPage: 1, total: 0 });

  const columns: TableColumnList = [
    { label: "货主编码", prop: "code", minWidth: 90 },
    { label: "货主名称", prop: "name", minWidth: 130 },
    { label: "联系人", prop: "contact", minWidth: 80 },
    { label: "电话", prop: "phone", minWidth: 110 },
    { label: "地址", prop: "address", minWidth: 140 },
    { label: "结算方式", prop: "settleType", minWidth: 80 },
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
      const { data } = await getOwnerPage({
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

  function openDialog(title: string, row?: OwnerItem) {
    addDialog({
      title,
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          code: row?.code ?? "",
          name: row?.name ?? "",
          contact: row?.contact ?? "",
          phone: row?.phone ?? "",
          address: row?.address ?? "",
          settleType: row?.settleType ?? "月结",
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<OwnerItem> }
        ).formInline;
        const req = formInline.id ? updateOwner(formInline) : addOwner(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: OwnerItem) {
    ElMessageBox.confirm(`确认删除货主「${row.name}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteOwner([row.id]).then(() => {
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

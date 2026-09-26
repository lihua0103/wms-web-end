import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getContainerPage,
  addContainer,
  updateContainer,
  deleteContainer
} from "@/api/master";
import type { ContainerItem } from "@/api/master";
import { containerTypeOptions, containerStatusOptions, dictLabel, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

export function useContainer() {
  const form = reactive({
    code: "",
    containerType: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ContainerItem[]>([]);
  const pagination = reactive({ pageSize: 10, currentPage: 1, total: 0 });

  const columns: TableColumnList = [
    { label: "容器编码", prop: "code", minWidth: 110 },
    {
      label: "容器类型",
      minWidth: 80,
      cellRenderer: ({ row }) => dictLabel(containerTypeOptions, row.containerType)
    },
    { label: "仓库", prop: "warehouseCode", minWidth: 80 },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(containerStatusOptions, row.status)}>
          {dictLabel(containerStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "绑定物料", prop: "materialCode", minWidth: 100 },
    { label: "所在库位", prop: "locationCode", minWidth: 110 },
    { label: "备注", prop: "remark", minWidth: 100 },
    { fixed: "right", label: "操作", width: 140, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getContainerPage({
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

  function openDialog(title: string, row?: ContainerItem) {
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
          containerType: row?.containerType ?? "pallet",
          warehouseCode: row?.warehouseCode ?? "WH001",
          status: row?.status ?? "idle",
          materialCode: row?.materialCode ?? "",
          locationCode: row?.locationCode ?? "",
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<ContainerItem> }
        ).formInline;
        const req = formInline.id ? updateContainer(formInline) : addContainer(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: ContainerItem) {
    ElMessageBox.confirm(`确认删除容器「${row.code}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteContainer([row.id]).then(() => {
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
    containerTypeOptions,
    containerStatusOptions,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

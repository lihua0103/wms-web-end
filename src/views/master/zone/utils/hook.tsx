import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getZonePage, addZone, updateZone, deleteZone } from "@/api/master";
import type { ZoneItem } from "@/api/master";
import { zoneTypeOptions, dictLabel } from "@/constants/wms";
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
    { label: "库区编码", prop: "code", minWidth: 100 },
    { label: "仓库", prop: "warehouseCode", minWidth: 90 },
    { label: "库区名称", prop: "name", minWidth: 120 },
    {
      label: "库区类型",
      minWidth: 100,
      cellRenderer: ({ row }) => dictLabel(zoneTypeOptions, row.zoneType)
    },
    { label: "库位数", prop: "locationCount", minWidth: 70 },
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
        const formInline = (
          options.props as { formInline: Partial<ZoneItem> }
        ).formInline;
        const req = formInline.id ? updateZone(formInline) : addZone(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: ZoneItem) {
    ElMessageBox.confirm(`确认删除库区「${row.name}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteZone([row.id]).then(() => {
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
    zoneTypeOptions,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

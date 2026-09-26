import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getCarrierPage,
  addCarrier,
  updateCarrier,
  deleteCarrier
} from "@/api/transport";
import type { CarrierItem } from "@/api/transport";
import { carrierTypeOptions, dictLabel, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

export function useCarrier() {
  const form = reactive({
    code: "",
    name: "",
    carrierType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<CarrierItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "编码", prop: "code", minWidth: 90 },
    { label: "承运商名称", prop: "name", minWidth: 120 },
    {
      label: "类型",
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(carrierTypeOptions, row.carrierType)
    },
    { label: "联系人", prop: "contact", minWidth: 80 },
    { label: "电话", prop: "phone", minWidth: 110 },
    { label: "服务区域", prop: "serviceArea", minWidth: 100 },
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
      const { data } = await getCarrierPage({
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

  function openDialog(title: string, row?: CarrierItem) {
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
          carrierType: row?.carrierType ?? "third",
          contact: row?.contact ?? "",
          phone: row?.phone ?? "",
          serviceArea: row?.serviceArea ?? "",
          settleType: row?.settleType ?? "月结",
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<CarrierItem> }
        ).formInline;
        const req = formInline.id ? updateCarrier(formInline) : addCarrier(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: CarrierItem) {
    ElMessageBox.confirm(`确认删除承运商「${row.name}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteCarrier([row.id]).then(() => {
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
    dictLabel,
    dictTag,
    carrierTypeOptions,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getLocationPage,
  addLocation,
  updateLocation,
  deleteLocation,
  generateLocations
} from "@/api/master";
import type { LocationItem } from "@/api/master";
import { locationTypeOptions, dictLabel } from "@/constants/wms";
import formComp from "../form.vue";
import genForm from "../gen-form.vue";

const statusMap: Record<string, { label: string; tag: string }> = {
  idle: { label: "空闲", tag: "success" },
  occupied: { label: "占用", tag: "primary" },
  disabled: { label: "禁用", tag: "danger" }
};

export function useLocation() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    locationType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<LocationItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "库位编码", prop: "code", minWidth: 140 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "库区", prop: "zoneCode", minWidth: 80 },
    {
      label: "库位类型",
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(locationTypeOptions, row.locationType)
    },
    { label: "最大承重(kg)", prop: "maxWeight", minWidth: 100 },
    { label: "最大容积(m³)", prop: "maxVolume", minWidth: 100 },
    {
      label: "混放",
      minWidth: 60,
      cellRenderer: ({ row }) => (row.isMix ? "允许" : "禁止")
    },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={statusMap[row.status]?.tag || "info"}>
          {statusMap[row.status]?.label || row.status}
        </el-tag>
      )
    },
    { fixed: "right", label: "操作", width: 140, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getLocationPage({
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

  function openDialog(title: string, row?: LocationItem) {
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
          zoneCode: row?.zoneCode ?? "",
          code: row?.code ?? "",
          locationType: row?.locationType ?? "shelf",
          maxWeight: row?.maxWeight ?? 1000,
          maxVolume: row?.maxVolume ?? 1,
          isMix: row?.isMix ?? 0,
          status: row?.status ?? "idle"
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<LocationItem> }
        ).formInline;
        const req = formInline.id ? updateLocation(formInline) : addLocation(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 批量生成库位 */
  function openGenDialog() {
    addDialog({
      title: "批量生成库位",
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: genForm,
      props: {
        formInline: {
          warehouseCode: "WH001",
          zoneCode: "",
          prefix: "1Z01",
          row: 5,
          col: 5,
          floor: 3
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as {
            formInline: {
              warehouseCode: string;
              zoneCode: string;
              prefix: string;
              row: number;
              col: number;
              floor: number;
            };
          }
        ).formInline;
        generateLocations(formInline).then(res => {
          message(res.msg || `成功生成 ${res.data} 个库位`, { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: LocationItem) {
    ElMessageBox.confirm(`确认删除库位「${row.code}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteLocation([row.id]).then(() => {
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
    statusMap,
    onSearch,
    resetForm,
    openDialog,
    openGenDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

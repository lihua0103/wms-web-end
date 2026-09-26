import { reactive, ref, onMounted } from "vue";
import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";
import { getPackingPage, checkPacking } from "@/api/outbound";
import type { PackingItem } from "@/api/outbound";
import { dictTag } from "@/constants/wms";
import formComp from "../form.vue";

const statusMap: Record<string, { label: string; tag: string }> = {
  waiting: { label: "待复核", tag: "warning" },
  processing: { label: "复核中", tag: "primary" },
  finished: { label: "已完成", tag: "success" }
};

export function usePacking() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<PackingItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "复核单号", prop: "code", minWidth: 130 },
    { label: "出库单号", prop: "orderCode", minWidth: 130 },
    { label: "波次号", prop: "waveCode", minWidth: 130 },
    { label: "物料编码", prop: "materialCode", minWidth: 100 },
    { label: "物料名称", prop: "materialName", minWidth: 110 },
    { label: "应复核", prop: "qty", minWidth: 70 },
    { label: "已复核", prop: "checkedQty", minWidth: 70 },
    { label: "重量(kg)", prop: "weight", minWidth: 80 },
    { label: "箱号", prop: "boxNo", minWidth: 100 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={statusMap[row.status]?.tag || "info"}>
          {statusMap[row.status]?.label || row.status}
        </el-tag>
      )
    },
    { label: "操作员", prop: "operator", minWidth: 70 },
    { fixed: "right", label: "操作", width: 100, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getPackingPage({
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

  /** 复核打包 */
  function openCheckDialog(row: PackingItem) {
    addDialog({
      title: "复核打包",
      width: "34%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row.id,
          code: row.code,
          qty: row.qty,
          checkedQty: row.checkedQty || row.qty,
          weight: row.weight
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as {
            formInline: { id: number; checkedQty: number; weight?: number };
          }
        ).formInline;
        checkPacking(formInline).then(() => {
          message("复核完成", { type: "success" });
          done();
          onSearch();
        });
      }
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
    openCheckDialog,
    handleSizeChange,
    handleCurrentChange
  };
}

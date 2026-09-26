import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getWavePage, generateWave, releaseWave } from "@/api/outbound";
import type { WaveItem } from "@/api/outbound";
import { docStatusOptions, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

const statusMap: Record<string, string> = {
  pending: "待下发",
  processing: "拣货中",
  finished: "已完成",
  cancelled: "已取消"
};

export function useWave() {
  const form = reactive({
    code: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<WaveItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "波次号", prop: "code", minWidth: 130 },
    { label: "仓库", prop: "warehouseCode", minWidth: 70 },
    { label: "订单数", prop: "orderCount", minWidth: 70 },
    { label: "总件数", prop: "qty", minWidth: 70 },
    { label: "承运商", prop: "carrierName", minWidth: 100 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(docStatusOptions, row.status)}>
          {statusMap[row.status] || row.status}
        </el-tag>
      )
    },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 110, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getWavePage({
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

  /** 生成波次 */
  function openGenerateDialog() {
    addDialog({
      title: "生成波次",
      width: "34%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          warehouseCode: "WH001",
          carrierName: ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: { warehouseCode: string; carrierName: string } }
        ).formInline;
        generateWave(formInline).then(res => {
          message(`波次 ${res.data?.code || ""} 生成成功`, { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 下发拣货 */
  function handleRelease(row: WaveItem) {
    ElMessageBox.confirm(
      `确认将波次「${row.code}」下发拣货吗？（共 ${row.orderCount} 单 / ${row.qty} 件）`,
      "提示",
      { type: "warning" }
    ).then(() => {
      releaseWave(row.id).then(() => {
        message("已下发拣货", { type: "success" });
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
    openGenerateDialog,
    handleRelease,
    handleSizeChange,
    handleCurrentChange
  };
}

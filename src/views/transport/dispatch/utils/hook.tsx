import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getDispatchPage,
  assignDispatch,
  signDispatch
} from "@/api/transport";
import type { DispatchItem } from "@/api/transport";
import { deliveryStatusOptions, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

export function useDispatch() {
  const form = reactive({
    code: "",
    customerName: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<DispatchItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "配送单号", prop: "code", minWidth: 130 },
    { label: "出库单号", prop: "orderCode", minWidth: 130 },
    { label: "客户", prop: "customerName", minWidth: 120 },
    { label: "收货地址", prop: "address", minWidth: 130 },
    { label: "承运商", prop: "carrierName", minWidth: 90 },
    { label: "车牌号", prop: "vehicleNo", minWidth: 90 },
    { label: "司机", prop: "driverName", minWidth: 70 },
    { label: "数量", prop: "qty", minWidth: 60 },
    {
      label: "状态",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(deliveryStatusOptions, row.status)}>
          {deliveryStatusOptions.find(d => d.value === row.status)?.label || row.status}
        </el-tag>
      )
    },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 150, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getDispatchPage({
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

  /** 调度：指定承运商/车辆/司机 */
  function openAssignDialog(row: DispatchItem) {
    addDialog({
      title: "配送调度",
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row.id,
          code: row.code,
          carrierName: row.carrierName ?? "",
          vehicleNo: row.vehicleNo ?? "",
          driverName: row.driverName ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as {
            formInline: {
              id: number;
              carrierName: string;
              vehicleNo: string;
              driverName: string;
            };
          }
        ).formInline;
        assignDispatch(formInline).then(() => {
          message("调度成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 签收 */
  function handleSign(row: DispatchItem) {
    ElMessageBox.confirm(`确认配送单「${row.code}」已签收吗？`, "提示", {
      type: "warning"
    }).then(() => {
      signDispatch(row.id).then(() => {
        message("签收成功", { type: "success" });
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
    openAssignDialog,
    handleSign,
    handleSizeChange,
    handleCurrentChange
  };
}

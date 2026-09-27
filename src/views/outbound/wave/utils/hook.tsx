import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { $t } from "@/plugins/i18n";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getWavePage, generateWave, releaseWave } from "@/api/outbound";
import type { WaveItem } from "@/api/outbound";
import { docStatusOptions, dictTag } from "@/constants/wms";
import Promotion from "~icons/ep/promotion";
import formComp from "../form.vue";

export function useWave() {
  const statusMap: Record<string, string> = {
    pending: $t("outbound.wave.statusPending"),
    processing: $t("outbound.wave.statusProcessing"),
    finished: $t("outbound.wave.statusFinished"),
    cancelled: $t("outbound.wave.statusCancelled")
  };

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
    { label: $t("outbound.wave.no"), prop: "code", minWidth: 130 },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 70
    },
    { label: $t("outbound.wave.orderCount"), prop: "orderCount", minWidth: 70 },
    { label: $t("outbound.wave.totalQty"), prop: "qty", minWidth: 70 },
    { label: $t("outbound.wave.carrier"), prop: "carrierName", minWidth: 100 },
    {
      label: $t("common.columns.status"),
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(docStatusOptions, row.status)}>
          {statusMap[row.status] || row.status}
        </el-tag>
      )
    },
    {
      label: $t("common.columns.createTime"),
      prop: "createdAt",
      minWidth: 140
    },
    {
      fixed: "right",
      label: $t("common.columns.operation"),
      minWidth: 190,
      showOverflowTooltip: false,
      cellRenderer: ({ row }) => (
        <ReTableOperation buttons={operationButtons(row)} />
      )
    }
  ];

  function operationButtons(row: WaveItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [];
    if (row.status === "pending") {
      buttons.push({
        label: $t("outbound.wave.release"),
        icon: Promotion,
        onClick: () => handleRelease(row)
      });
    }
    return buttons;
  }

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
      title: $t("outbound.wave.generate"),
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
          options.props as {
            formInline: { warehouseCode: string; carrierName: string };
          }
        ).formInline;
        generateWave(formInline).then(res => {
          message(
            $t("outbound.wave.waveCreated", { code: res.data?.code || "" }),
            {
              type: "success"
            }
          );
          done();
          onSearch();
        });
      }
    });
  }

  /** 下发拣货 */
  function handleRelease(row: WaveItem) {
    ElMessageBox.confirm(
      $t("outbound.wave.releaseTip", {
        code: row.code,
        count: row.orderCount,
        qty: row.qty
      }),
      $t("outbound.wave.tip"),
      { type: "warning" }
    ).then(() => {
      releaseWave(row.id).then(() => {
        message($t("outbound.wave.released"), { type: "success" });
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

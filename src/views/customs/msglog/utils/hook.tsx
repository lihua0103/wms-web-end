import { reactive, ref, onMounted } from "vue";
import { message } from "@/utils/message";
import { $t } from "@/plugins/i18n";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getMsgLogPage, resendMsgLog } from "@/api/customs";
import type { CustomsMsgLogItem } from "@/api/customs";
import {
  dictLabel,
  dictTag,
  customsMsgTypeOptions,
  customsChannelOptions,
  customsMsgDirectionOptions,
  customsMsgStatusOptions
} from "@/constants/wms";
import View from "~icons/ep/view";
import RefreshRight from "~icons/ep/refresh-right";

export function useCustomsMsgLog() {
  const form = reactive({
    msgNo: "",
    bizNo: "",
    msgType: "",
    channel: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<CustomsMsgLogItem[]>([]);

  /** 详情抽屉 */
  const detailVisible = ref(false);
  const currentRow = ref<CustomsMsgLogItem | null>(null);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("customs.msglog.msgNo"), prop: "msgNo", minWidth: 140 },
    {
      label: $t("customs.msglog.msgType"),
      minWidth: 120,
      cellRenderer: ({ row }) => dictLabel(customsMsgTypeOptions, row.msgType)
    },
    {
      label: $t("customs.msglog.channel"),
      minWidth: 160,
      cellRenderer: ({ row }) => dictLabel(customsChannelOptions, row.channel)
    },
    {
      label: $t("customs.msglog.direction"),
      minWidth: 130,
      cellRenderer: ({ row }) =>
        dictLabel(customsMsgDirectionOptions, row.direction)
    },
    { label: $t("customs.msglog.bizNoPh"), prop: "bizNo", minWidth: 150 },
    {
      label: $t("common.columns.status"),
      minWidth: 90,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(customsMsgStatusOptions, row.status)}>
          {dictLabel(customsMsgStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("customs.msglog.resendCount"),
      prop: "resendCount",
      minWidth: 80
    },
    {
      label: $t("customs.msglog.errorMsg"),
      prop: "errorMsg",
      minWidth: 160,
      cellRenderer: ({ row }) =>
        row.errorMsg ? (
          <span style="color: var(--el-color-danger)">{row.errorMsg}</span>
        ) : (
          "-"
        )
    },
    { label: $t("customs.msglog.createdAt"), prop: "createdAt", minWidth: 140 },
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

  function operationButtons(row: CustomsMsgLogItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.detail"),
        icon: View,
        onClick: () => openDetail(row)
      }
    ];
    if (row.status === "fail" || row.status === "resend") {
      buttons.push({
        label: $t("common.buttons.resend"),
        type: "warning",
        icon: RefreshRight,
        onClick: () => handleResend(row)
      });
    }
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getMsgLogPage({
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

  /** 失败报文重发 */
  function handleResend(row: CustomsMsgLogItem) {
    resendMsgLog(row.id).then(() => {
      message($t("customs.msglog.resentTip", { no: row.msgNo }), {
        type: "success"
      });
      onSearch();
    });
  }

  /** 详情抽屉 */
  function openDetail(row: CustomsMsgLogItem) {
    currentRow.value = row;
    detailVisible.value = true;
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
    detailVisible,
    currentRow,
    onSearch,
    resetForm,
    handleResend,
    openDetail,
    handleSizeChange,
    handleCurrentChange
  };
}

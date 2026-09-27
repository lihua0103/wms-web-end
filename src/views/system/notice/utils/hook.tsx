import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getNoticePage,
  addNotice,
  readNotice,
  deleteNotice
} from "@/api/system";
import type { NoticeItem } from "@/api/system";
import type { DictItem } from "@/constants/wms";
import { dictLabel, dictTag } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import View from "~icons/ep/view";
import Check from "~icons/ep/check";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

/** 消息类型选项 */
export const noticeTypeOptions: DictItem[] = [
  { label: $t("system.notice.typeNotice"), value: "notice", tag: "info" },
  {
    label: $t("system.notice.typeAnnounce"),
    value: "announce",
    tag: "success"
  },
  { label: $t("system.notice.typeWarning"), value: "warning", tag: "danger" }
];

/** 消息级别选项 */
export const noticeLevelOptions: DictItem[] = [
  { label: $t("system.notice.levelHigh"), value: "high", tag: "danger" },
  { label: $t("system.notice.levelNormal"), value: "normal", tag: "" },
  { label: $t("system.notice.levelLow"), value: "low", tag: "info" }
];

/** 阅读状态选项 */
export const readStatusOptions: DictItem[] = [
  { label: $t("system.notice.read"), value: 1, tag: "success" },
  { label: $t("system.notice.unread"), value: 0, tag: "warning" }
];

export function useNotice() {
  const form = reactive({
    keyword: "",
    type: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<NoticeItem[]>([]);
  const detailVisible = ref(false);
  const currentRow = ref<NoticeItem>();

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("system.notice.title"), prop: "title", minWidth: 160 },
    {
      label: $t("common.columns.type"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(noticeTypeOptions, row.type)}>
          {dictLabel(noticeTypeOptions, row.type)}
        </el-tag>
      )
    },
    {
      label: $t("system.notice.level"),
      minWidth: 60,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(noticeLevelOptions, row.level)}>
          {dictLabel(noticeLevelOptions, row.level)}
        </el-tag>
      )
    },
    {
      label: $t("system.notice.publisher"),
      prop: "publisher",
      minWidth: 80
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(readStatusOptions, row.status)}>
          {dictLabel(readStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("system.notice.publishTime"),
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

  function operationButtons(row: NoticeItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.view"),
        icon: View,
        onClick: () => openDetail(row)
      }
    ];
    if (row.status === 0) {
      buttons.push({
        label: $t("system.notice.markRead"),
        type: "success",
        icon: Check,
        onClick: () => handleRead(row)
      });
    }
    buttons.push({
      label: $t("common.buttons.delete"),
      type: "danger",
      icon: Delete,
      onClick: () => handleDelete(row)
    });
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getNoticePage({
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

  /** 发布公告/通知 */
  function openDialog(title: string) {
    addDialog({
      title,
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          title: "",
          type: "notice",
          level: "normal",
          content: "",
          status: 0,
          publisher: "admin"
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<NoticeItem> }
        ).formInline;
        addNotice(formInline).then(() => {
          message($t("system.notice.publishSuccess"), { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 查看消息（抽屉展示 content） */
  function openDetail(row: NoticeItem) {
    currentRow.value = row;
    detailVisible.value = true;
  }

  /** 标记已读 */
  function handleRead(row: NoticeItem) {
    readNotice([row.id]).then(() => {
      message($t("system.notice.readSuccess"), { type: "success" });
      onSearch();
    });
  }

  function handleDelete(row: NoticeItem) {
    ElMessageBox.confirm(
      $t("system.notice.deleteConfirm", { title: row.title }),
      $t("system.notice.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteNotice([row.id]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
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
    detailVisible,
    currentRow,
    onSearch,
    resetForm,
    openDialog,
    openDetail,
    handleRead,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getNoticePage,
  addNotice,
  readNotice,
  deleteNotice
} from "@/api/system";
import type { NoticeItem } from "@/api/system";
import type { DictItem } from "@/constants/wms";
import { dictLabel, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

/** 消息类型选项 */
export const noticeTypeOptions: DictItem[] = [
  { label: "通知", value: "notice", tag: "info" },
  { label: "公告", value: "announce", tag: "success" },
  { label: "预警", value: "warning", tag: "danger" }
];

/** 消息级别选项 */
export const noticeLevelOptions: DictItem[] = [
  { label: "高", value: "high", tag: "danger" },
  { label: "普通", value: "normal", tag: "" },
  { label: "低", value: "low", tag: "info" }
];

/** 阅读状态选项 */
export const readStatusOptions: DictItem[] = [
  { label: "已读", value: 1, tag: "success" },
  { label: "未读", value: 0, tag: "warning" }
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
    { label: "标题", prop: "title", minWidth: 160 },
    {
      label: "类型",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(noticeTypeOptions, row.type)}>
          {dictLabel(noticeTypeOptions, row.type)}
        </el-tag>
      )
    },
    {
      label: "级别",
      minWidth: 60,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(noticeLevelOptions, row.level)}>
          {dictLabel(noticeLevelOptions, row.level)}
        </el-tag>
      )
    },
    { label: "发布人", prop: "publisher", minWidth: 80 },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(readStatusOptions, row.status)}>
          {dictLabel(readStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "发布时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 230, slot: "operation" }
  ];

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
          message("发布成功", { type: "success" });
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
      message("已标记为已读", { type: "success" });
      onSearch();
    });
  }

  function handleDelete(row: NoticeItem) {
    ElMessageBox.confirm(`确认删除消息「${row.title}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteNotice([row.id]).then(() => {
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

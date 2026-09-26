import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getParamPage, addParam, updateParam, deleteParam } from "@/api/system";
import type { ParamItem } from "@/api/system";
import type { DictItem } from "@/constants/wms";
import { dictLabel, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

/** 参数来源选项 */
export const builtInOptions: DictItem[] = [
  { label: "内置", value: 1, tag: "warning" },
  { label: "自定义", value: 0, tag: "info" }
];

export function useParams() {
  const form = reactive({
    keyword: "",
    builtIn: ""
  });
  const loading = ref(false);
  const dataList = ref<ParamItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "参数名称", prop: "name", minWidth: 140 },
    { label: "参数键", prop: "key", minWidth: 150 },
    { label: "参数值", prop: "value", minWidth: 100 },
    {
      label: "来源",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(builtInOptions, row.builtIn)}>
          {dictLabel(builtInOptions, row.builtIn)}
        </el-tag>
      )
    },
    { label: "备注", prop: "remark", minWidth: 110 },
    { label: "更新时间", prop: "updatedAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 160, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getParamPage({
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

  /** 新增/编辑参数弹窗（内置参数 builtIn=1 编辑时 key 禁改） */
  function openDialog(title: string, row?: ParamItem) {
    addDialog({
      title,
      width: "42%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          name: row?.name ?? "",
          key: row?.key ?? "",
          value: row?.value ?? "",
          builtIn: row?.builtIn ?? 0,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (options.props as { formInline: Partial<ParamItem> })
          .formInline;
        const req = formInline.id
          ? updateParam(formInline)
          : addParam(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: ParamItem) {
    ElMessageBox.confirm(`确认删除参数「${row.name}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteParam([row.id]).then(() => {
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
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

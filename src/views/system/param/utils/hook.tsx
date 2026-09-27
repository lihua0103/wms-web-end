import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getParamPage, addParam, updateParam, deleteParam } from "@/api/system";
import type { ParamItem } from "@/api/system";
import type { DictItem } from "@/constants/wms";
import { dictLabel, dictTag } from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

/** 参数来源选项 */
export const builtInOptions: DictItem[] = [
  { label: $t("system.param.builtIn"), value: 1, tag: "warning" },
  { label: $t("system.param.custom"), value: 0, tag: "info" }
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
    { label: $t("system.param.name"), prop: "name", minWidth: 140 },
    { label: $t("system.param.key"), prop: "key", minWidth: 150 },
    { label: $t("system.param.value"), prop: "value", minWidth: 100 },
    {
      label: $t("system.param.source"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(builtInOptions, row.builtIn)}>
          {dictLabel(builtInOptions, row.builtIn)}
        </el-tag>
      )
    },
    { label: $t("common.columns.remark"), prop: "remark", minWidth: 110 },
    {
      label: $t("common.columns.updateTime"),
      prop: "updatedAt",
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

  function operationButtons(row: ParamItem): TableOperationButton[] {
    return [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("system.param.editParam"), row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      }
    ];
  }

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
          message(
            formInline.id
              ? $t("system.param.editSuccess")
              : $t("system.param.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: ParamItem) {
    ElMessageBox.confirm(
      $t("system.param.deleteConfirm", { name: row.name }),
      $t("system.param.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteParam([row.id]).then(() => {
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
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { getRulePage, addRule, updateRule, deleteRule } from "@/api/billing";
import type { FeeRuleItem } from "@/api/billing";
import {
  feeTypeOptions,
  userStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import { $t } from "@/plugins/i18n";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

export function useBillingRule() {
  const form = reactive({
    code: "",
    ownerName: "",
    feeType: "",
    status: "" as string | number
  });
  const loading = ref(false);
  const dataList = ref<FeeRuleItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("billing.rule.code"), prop: "code", minWidth: 100 },
    { label: $t("common.columns.owner"), prop: "ownerName", minWidth: 110 },
    {
      label: $t("billing.rule.feeType"),
      minWidth: 80,
      cellRenderer: ({ row }) => dictLabel(feeTypeOptions, row.feeType)
    },
    { label: $t("billing.rule.unit"), prop: "unit", minWidth: 70 },
    {
      label: $t("billing.rule.price"),
      prop: "price",
      minWidth: 80,
      formatter: row => Number(row.price).toFixed(2)
    },
    {
      label: $t("billing.rule.minimumFeeCol"),
      prop: "minimumFee",
      minWidth: 100,
      formatter: row => Number(row.minimumFee).toFixed(2)
    },
    {
      label: $t("billing.rule.effectiveFrom"),
      prop: "effectiveFrom",
      minWidth: 90
    },
    {
      label: $t("billing.rule.effectiveTo"),
      prop: "effectiveTo",
      minWidth: 90
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(userStatusOptions, row.status)}>
          {dictLabel(userStatusOptions, row.status)}
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

  function operationButtons(row: FeeRuleItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("billing.rule.editTitle"), row)
      },
      {
        label: $t("common.buttons.delete"),
        type: "danger",
        icon: Delete,
        onClick: () => handleDelete(row)
      }
    ];
    return buttons;
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getRulePage({
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

  /** 新增/编辑计费规则弹窗 */
  function openDialog(title: string, row?: FeeRuleItem) {
    addDialog({
      title,
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: true,
      // 注意：formInline 经 options.props 由 v-bind 透传给 form.vue，
      // 与 beforeSure 中读取的是同一对象引用
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          code: row?.code ?? "",
          ownerName: row?.ownerName ?? "",
          feeType: row?.feeType ?? "",
          unit: row?.unit ?? "",
          price: row?.price ?? 0,
          minimumFee: row?.minimumFee ?? 0,
          effectiveFrom: row?.effectiveFrom ?? "",
          effectiveTo: row?.effectiveTo ?? "",
          status: row?.status ?? 1
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<FeeRuleItem> }
        ).formInline;
        const req = formInline.id
          ? updateRule(formInline)
          : addRule(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("billing.rule.updateSuccess")
              : $t("billing.rule.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: FeeRuleItem) {
    ElMessageBox.confirm(
      $t("billing.rule.deleteTip", { code: row.code }),
      $t("billing.rule.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteRule([row.id]).then(() => {
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

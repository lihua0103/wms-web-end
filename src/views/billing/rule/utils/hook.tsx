import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getRulePage, addRule, updateRule, deleteRule } from "@/api/billing";
import type { FeeRuleItem } from "@/api/billing";
import {
  feeTypeOptions,
  userStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
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
    { label: "规则编码", prop: "code", minWidth: 100 },
    { label: "货主", prop: "ownerName", minWidth: 110 },
    {
      label: "费用类型",
      minWidth: 80,
      cellRenderer: ({ row }) => dictLabel(feeTypeOptions, row.feeType)
    },
    { label: "计费单位", prop: "unit", minWidth: 70 },
    {
      label: "单价（元）",
      prop: "price",
      minWidth: 80,
      formatter: row => Number(row.price).toFixed(2)
    },
    {
      label: "最低费用（元）",
      prop: "minimumFee",
      minWidth: 100,
      formatter: row => Number(row.minimumFee).toFixed(2)
    },
    { label: "生效日期", prop: "effectiveFrom", minWidth: 90 },
    { label: "失效日期", prop: "effectiveTo", minWidth: 90 },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(userStatusOptions, row.status)}>
          {dictLabel(userStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 150, slot: "operation" }
  ];

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
        const req = formInline.id ? updateRule(formInline) : addRule(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: FeeRuleItem) {
    ElMessageBox.confirm(`确认删除计费规则「${row.code}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteRule([row.id]).then(() => {
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

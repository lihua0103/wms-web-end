import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import { $t } from "@/plugins/i18n";
import {
  getCustomerPage,
  addCustomer,
  updateCustomer,
  deleteCustomer
} from "@/api/master";
import type { CustomerItem } from "@/api/master";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

export function useCustomer() {
  const form = reactive({ code: "", name: "", status: "" });
  const loading = ref(false);
  const dataList = ref<CustomerItem[]>([]);
  const pagination = reactive({ pageSize: 10, currentPage: 1, total: 0 });

  const columns: TableColumnList = [
    { label: $t("master.customer.code"), prop: "code", minWidth: 90 },
    { label: $t("master.customer.name"), prop: "name", minWidth: 140 },
    { label: $t("master.customer.contact"), prop: "contact", minWidth: 80 },
    { label: $t("master.customer.phone"), prop: "phone", minWidth: 110 },
    { label: $t("master.customer.address"), prop: "address", minWidth: 150 },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1
            ? $t("master.customer.enabled")
            : $t("master.customer.disabled")}
        </el-tag>
      )
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

  function operationButtons(row: CustomerItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("master.customer.editTitle"), row)
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
      const { data } = await getCustomerPage({
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

  function openDialog(title: string, row?: CustomerItem) {
    addDialog({
      title,
      width: "40%",
      draggable: true,
      closeOnClickModal: false,
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          code: row?.code ?? "",
          name: row?.name ?? "",
          contact: row?.contact ?? "",
          phone: row?.phone ?? "",
          address: row?.address ?? "",
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<CustomerItem> }
        ).formInline;
        const req = formInline.id
          ? updateCustomer(formInline)
          : addCustomer(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("master.customer.editSuccess")
              : $t("master.customer.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: CustomerItem) {
    ElMessageBox.confirm(
      $t("master.customer.delTip", { name: row.name }),
      $t("master.customer.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteCustomer([row.id]).then(() => {
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

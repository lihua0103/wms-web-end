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
  getContainerPage,
  addContainer,
  updateContainer,
  deleteContainer
} from "@/api/master";
import type { ContainerItem } from "@/api/master";
import {
  containerTypeOptions,
  containerStatusOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import formComp from "../form.vue";

export function useContainer() {
  const form = reactive({
    code: "",
    containerType: "",
    warehouseCode: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<ContainerItem[]>([]);
  const pagination = reactive({ pageSize: 10, currentPage: 1, total: 0 });

  const columns: TableColumnList = [
    { label: $t("master.container.code"), prop: "code", minWidth: 110 },
    {
      label: $t("master.container.containerType"),
      minWidth: 80,
      cellRenderer: ({ row }) =>
        dictLabel(containerTypeOptions, row.containerType)
    },
    {
      label: $t("common.columns.warehouse"),
      prop: "warehouseCode",
      minWidth: 80
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(containerStatusOptions, row.status)}>
          {dictLabel(containerStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("master.container.bindingMaterial"),
      prop: "materialCode",
      minWidth: 100
    },
    {
      label: $t("master.container.currentLocation"),
      prop: "locationCode",
      minWidth: 110
    },
    { label: $t("common.columns.remark"), prop: "remark", minWidth: 100 },
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

  function operationButtons(row: ContainerItem): TableOperationButton[] {
    const buttons: TableOperationButton[] = [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("master.container.editTitle"), row)
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
      const { data } = await getContainerPage({
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

  function openDialog(title: string, row?: ContainerItem) {
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
          containerType: row?.containerType ?? "pallet",
          warehouseCode: row?.warehouseCode ?? "WH001",
          status: row?.status ?? "idle",
          materialCode: row?.materialCode ?? "",
          locationCode: row?.locationCode ?? "",
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<ContainerItem> }
        ).formInline;
        const req = formInline.id
          ? updateContainer(formInline)
          : addContainer(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("master.container.editSuccess")
              : $t("master.container.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: ContainerItem) {
    ElMessageBox.confirm(
      $t("master.container.delTip", { code: row.code }),
      $t("master.container.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteContainer([row.id]).then(() => {
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
    containerTypeOptions,
    containerStatusOptions,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

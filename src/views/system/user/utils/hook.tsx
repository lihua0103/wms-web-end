import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getUserPage,
  addUser,
  updateUser,
  deleteUser,
  resetUserPwd
} from "@/api/system";
import type { UserItem } from "@/api/system";
import { $t } from "@/plugins/i18n";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Key from "~icons/ep/key";
import formComp from "../form.vue";

export function useUser() {
  const form = reactive({
    username: "",
    nickname: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<UserItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("system.user.userAccount"), prop: "username", minWidth: 100 },
    { label: $t("system.user.userNickname"), prop: "nickname", minWidth: 100 },
    { label: $t("system.user.phone"), prop: "phone", minWidth: 110 },
    { label: $t("system.user.dept"), prop: "dept", minWidth: 100 },
    {
      label: $t("system.user.warehouse"),
      prop: "warehouseCodes",
      minWidth: 120,
      formatter: row => (row.warehouseCodes || []).join("、") || "-"
    },
    { label: $t("system.user.role"), prop: "roles", minWidth: 100 },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1
            ? $t("common.buttons.enabled")
            : $t("common.buttons.disabled")}
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

  function operationButtons(row: UserItem): TableOperationButton[] {
    return [
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("system.user.editUser"), row)
      },
      {
        label: $t("system.user.resetPwd"),
        type: "warning",
        icon: Key,
        onClick: () => handleResetPwd(row)
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
      const { data } = await getUserPage({
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

  /** 新增/编辑用户弹窗 */
  function openDialog(title: string, row?: UserItem) {
    addDialog({
      title,
      width: "46%",
      draggable: true,
      closeOnClickModal: false,
      fullscreenIcon: "ep/full-screen",
      content: formComp,
      props: {
        formInline: {
          id: row?.id,
          username: row?.username ?? "",
          nickname: row?.nickname ?? "",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          dept: row?.dept ?? "",
          warehouseCodes: row?.warehouseCodes ?? [],
          roles: row?.roles ?? [],
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (options.props as { formInline: Partial<UserItem> })
          .formInline;
        const req = formInline.id
          ? updateUser(formInline)
          : addUser(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("system.user.editSuccess")
              : $t("system.user.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: UserItem) {
    ElMessageBox.confirm(
      $t("system.user.deleteConfirm", { name: row.nickname }),
      $t("system.user.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteUser([row.id]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
        onSearch();
      });
    });
  }

  function handleResetPwd(row: UserItem) {
    resetUserPwd(row.id).then(() => {
      message($t("system.user.resetPwdSuccess"), { type: "success" });
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
    handleResetPwd,
    handleSizeChange,
    handleCurrentChange
  };
}

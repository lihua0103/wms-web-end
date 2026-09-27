import { reactive, ref, onMounted, nextTick } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
import {
  getRolePage,
  addRole,
  updateRole,
  deleteRole,
  getRoleMenus,
  saveRoleMenus,
  getMenuTree
} from "@/api/system";
import type { RoleItem, MenuItem } from "@/api/system";
import { $t } from "@/plugins/i18n";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Key from "~icons/ep/key";
import formComp from "../form.vue";

export function useRole() {
  const form = reactive({
    keyword: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<RoleItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: $t("system.role.code"), prop: "code", minWidth: 110 },
    { label: $t("system.role.name"), prop: "name", minWidth: 100 },
    {
      label: $t("system.role.description"),
      prop: "description",
      minWidth: 140
    },
    {
      label: $t("system.role.memberCount"),
      prop: "memberCount",
      minWidth: 70
    },
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

  function operationButtons(row: RoleItem): TableOperationButton[] {
    return [
      {
        label: $t("system.role.menuAuth"),
        icon: Key,
        onClick: () => openAuth(row)
      },
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("system.role.editRole"), row)
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
      const { data } = await getRolePage({
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

  /** 新增/编辑角色弹窗 */
  function openDialog(title: string, row?: RoleItem) {
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
          code: row?.code ?? "",
          name: row?.name ?? "",
          description: row?.description ?? "",
          status: row?.status ?? 1
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (options.props as { formInline: Partial<RoleItem> })
          .formInline;
        const req = formInline.id
          ? updateRole(formInline)
          : addRole(formInline);
        req.then(() => {
          message(
            formInline.id
              ? $t("system.role.editSuccess")
              : $t("system.role.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: RoleItem) {
    ElMessageBox.confirm(
      $t("system.role.deleteConfirm", { name: row.name }),
      $t("system.role.tip"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteRole([row.id]).then(() => {
        message($t("common.tips.deleteSuccess"), { type: "success" });
        onSearch();
      });
    });
  }

  // ========================= 菜单授权 =========================

  const authVisible = ref(false);
  const authLoading = ref(false);
  const saveLoading = ref(false);
  const currentRole = ref<RoleItem>();
  const menuTreeData = ref<MenuItem[]>([]);
  const menuTreeRef = ref();

  /** 打开菜单授权弹窗 */
  async function openAuth(row: RoleItem) {
    currentRole.value = row;
    authVisible.value = true;
    authLoading.value = true;
    try {
      const [treeRes, menusRes] = await Promise.all([
        getMenuTree(),
        getRoleMenus(row.id)
      ]);
      menuTreeData.value = treeRes.data;
      await nextTick();
      menuTreeRef.value?.setCheckedKeys(menusRes.data ?? []);
    } finally {
      authLoading.value = false;
    }
  }

  /** 保存角色菜单授权（勾选 + 半选的父节点一并提交） */
  function saveAuth() {
    if (!currentRole.value) return;
    const tree = menuTreeRef.value;
    if (!tree) return;
    const menuIds = [
      ...(tree.getCheckedKeys() as number[]),
      ...(tree.getHalfCheckedKeys() as number[])
    ];
    saveLoading.value = true;
    saveRoleMenus(currentRole.value.id, menuIds)
      .then(() => {
        message(
          $t("system.role.authSuccess", { name: currentRole.value?.name }),
          {
            type: "success"
          }
        );
        authVisible.value = false;
      })
      .finally(() => {
        saveLoading.value = false;
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
    authVisible,
    authLoading,
    saveLoading,
    currentRole,
    menuTreeData,
    menuTreeRef,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    openAuth,
    saveAuth,
    handleSizeChange,
    handleCurrentChange
  };
}

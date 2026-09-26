import { reactive, ref, onMounted, nextTick } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
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
    { label: "角色编码", prop: "code", minWidth: 110 },
    { label: "角色名称", prop: "name", minWidth: 100 },
    { label: "描述", prop: "description", minWidth: 140 },
    { label: "成员数", prop: "memberCount", minWidth: 70 },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
    },
    { label: "创建时间", prop: "createdAt", minWidth: 140 },
    { fixed: "right", label: "操作", width: 240, slot: "operation" }
  ];

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
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: RoleItem) {
    ElMessageBox.confirm(`确认删除角色「${row.name}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteRole([row.id]).then(() => {
        message("删除成功", { type: "success" });
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
        message(`角色「${currentRole.value?.name}」授权成功`, {
          type: "success"
        });
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

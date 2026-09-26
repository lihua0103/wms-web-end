import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getUserPage,
  addUser,
  updateUser,
  deleteUser,
  resetUserPwd
} from "@/api/system";
import type { UserItem } from "@/api/system";
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
    { label: "用户账号", prop: "username", minWidth: 100 },
    { label: "用户昵称", prop: "nickname", minWidth: 100 },
    { label: "手机号", prop: "phone", minWidth: 110 },
    { label: "部门", prop: "dept", minWidth: 100 },
    {
      label: "所属仓库",
      prop: "warehouseCodes",
      minWidth: 120,
      formatter: row => (row.warehouseCodes || []).join("、") || "-"
    },
    { label: "角色", prop: "roles", minWidth: 100 },
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
    { fixed: "right", label: "操作", width: 220, slot: "operation" }
  ];

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
        const req = formInline.id ? updateUser(formInline) : addUser(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: UserItem) {
    ElMessageBox.confirm(`确认删除用户「${row.nickname}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteUser([row.id]).then(() => {
        message("删除成功", { type: "success" });
        onSearch();
      });
    });
  }

  function handleResetPwd(row: UserItem) {
    resetUserPwd(row.id).then(() => {
      message("密码已重置为 123456", { type: "success" });
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

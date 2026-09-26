import { ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getMenuTree, addMenu, updateMenu, deleteMenu } from "@/api/system";
import type { MenuItem } from "@/api/system";
import type { DictItem } from "@/constants/wms";
import { dictLabel, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

/** 菜单类型选项 */
export const menuTypeOptions: DictItem[] = [
  { label: "目录", value: "dir", tag: "" },
  { label: "菜单", value: "menu", tag: "success" },
  { label: "按钮", value: "button", tag: "warning" }
];

/** 将菜单树拍平为上级菜单下拉选项 */
function flattenOptions(
  tree: MenuItem[],
  depth = 0
): { id: number; label: string }[] {
  const res: { id: number; label: string }[] = [];
  const walk = (nodes: MenuItem[], d: number) => {
    for (const n of nodes) {
      res.push({ id: Number(n.id), label: `${"　".repeat(d)}${n.name}` });
      if (n.children?.length) walk(n.children as MenuItem[], d + 1);
    }
  };
  walk(tree, depth);
  return res;
}

export function useMenu() {
  const loading = ref(false);
  const dataList = ref<MenuItem[]>([]);

  const columns: TableColumnList = [
    { label: "菜单名称", prop: "name", minWidth: 140 },
    {
      label: "类型",
      prop: "menuType",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(menuTypeOptions, row.menuType)}>
          {dictLabel(menuTypeOptions, row.menuType)}
        </el-tag>
      )
    },
    { label: "图标", prop: "icon", minWidth: 100 },
    { label: "路由地址", prop: "path", minWidth: 130 },
    { label: "组件路径", prop: "component", minWidth: 140 },
    { label: "权限标识", prop: "permission", minWidth: 140 },
    { label: "排序", prop: "sort", minWidth: 60 },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
    },
    { fixed: "right", label: "操作", width: 200, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getMenuTree();
      dataList.value = data;
    } finally {
      loading.value = false;
    }
  }

  /** 新增/编辑菜单弹窗，parentRow 传入时为"新增子菜单" */
  function openDialog(title: string, row?: MenuItem, parentRow?: MenuItem) {
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
          parentId: row?.parentId ?? parentRow?.id ?? null,
          menuType: row?.menuType ?? "menu",
          name: row?.name ?? "",
          path: row?.path ?? "",
          component: row?.component ?? "",
          icon: row?.icon ?? "",
          permission: row?.permission ?? "",
          sort: row?.sort ?? 1,
          status: row?.status ?? 1
        },
        parentOptions: flattenOptions(dataList.value)
      },
      beforeSure: (done, { options }) => {
        const formInline = (options.props as { formInline: Partial<MenuItem> })
          .formInline;
        const req = formInline.id
          ? updateMenu(formInline)
          : addMenu(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: MenuItem) {
    ElMessageBox.confirm(
      `确认删除菜单「${row.name}」吗？其子节点将一并失效`,
      "提示",
      { type: "warning" }
    ).then(() => {
      deleteMenu([Number(row.id)]).then(() => {
        message("删除成功", { type: "success" });
        onSearch();
      });
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    loading,
    columns,
    dataList,
    onSearch,
    openDialog,
    handleDelete
  };
}

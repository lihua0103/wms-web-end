import { ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { getOrgTree, addOrg, updateOrg, deleteOrg } from "@/api/system";
import type { OrgItem } from "@/api/system";
import type { DictItem } from "@/constants/wms";
import { dictLabel, dictTag } from "@/constants/wms";
import formComp from "../form.vue";

/** 组织类型选项 */
export const orgTypeOptions: DictItem[] = [
  { label: "公司", value: "company", tag: "" },
  { label: "仓库", value: "warehouse", tag: "success" },
  { label: "部门", value: "dept", tag: "warning" }
];

/** 将组织树拍平为上级组织下拉选项 */
function flattenOptions(
  tree: OrgItem[],
  depth = 0
): { id: number; label: string }[] {
  const res: { id: number; label: string }[] = [];
  const walk = (nodes: OrgItem[], d: number) => {
    for (const n of nodes) {
      res.push({ id: Number(n.id), label: `${"　".repeat(d)}${n.name}` });
      if (n.children?.length) walk(n.children as OrgItem[], d + 1);
    }
  };
  walk(tree, depth);
  return res;
}

export function useOrg() {
  const loading = ref(false);
  const dataList = ref<OrgItem[]>([]);

  const columns: TableColumnList = [
    { label: "组织名称", prop: "name", minWidth: 180 },
    {
      label: "类型",
      prop: "type",
      minWidth: 80,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(orgTypeOptions, row.type)}>
          {dictLabel(orgTypeOptions, row.type)}
        </el-tag>
      )
    },
    { label: "负责人", prop: "leader", minWidth: 100 },
    { label: "联系电话", prop: "phone", minWidth: 120 },
    { fixed: "right", label: "操作", width: 220, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getOrgTree();
      dataList.value = data;
    } finally {
      loading.value = false;
    }
  }

  /** 新增/编辑组织弹窗，parentRow 传入时为"新增子级" */
  function openDialog(title: string, row?: OrgItem, parentRow?: OrgItem) {
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
          parentId: row?.parentId ?? parentRow?.id ?? null,
          type: row?.type ?? "dept",
          name: row?.name ?? "",
          leader: row?.leader ?? "",
          phone: row?.phone ?? ""
        },
        parentOptions: flattenOptions(dataList.value)
      },
      beforeSure: (done, { options }) => {
        const formInline = (options.props as { formInline: Partial<OrgItem> })
          .formInline;
        const req = formInline.id ? updateOrg(formInline) : addOrg(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  function handleDelete(row: OrgItem) {
    ElMessageBox.confirm(
      `确认删除组织「${row.name}」吗？其下级组织将一并失效`,
      "提示",
      { type: "warning" }
    ).then(() => {
      deleteOrg([Number(row.id)]).then(() => {
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

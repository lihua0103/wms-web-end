import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import {
  getIntegrationConfigPage,
  addIntegrationConfig,
  updateIntegrationConfig,
  deleteIntegrationConfig,
  testIntegrationConfig
} from "@/api/integration";
import type { IntegrationConfigItem } from "@/api/integration";
import type { DictItem } from "@/constants/wms";
import {
  integrationTypeOptions,
  apiDirectionOptions,
  dictLabel,
  dictTag
} from "@/constants/wms";
import formComp from "../form.vue";

/** 认证方式 */
export const authTypeOptions: DictItem[] = [
  { label: "Token 令牌", value: "token" },
  { label: "签名认证", value: "signature" }
];

/** 配置启停状态 */
export const configStatusOptions: DictItem[] = [
  { label: "启用", value: "enabled", tag: "success" },
  { label: "停用", value: "disabled", tag: "info" }
];

export function useIntegrationConfig() {
  const form = reactive({
    systemName: "",
    systemType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<IntegrationConfigItem[]>([]);

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    { label: "系统名称", prop: "systemName", minWidth: 120 },
    {
      label: "系统类型",
      minWidth: 100,
      cellRenderer: ({ row }) =>
        dictLabel(integrationTypeOptions, row.systemType)
    },
    { label: "API 地址", prop: "apiUrl", minWidth: 180 },
    {
      label: "认证方式",
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(authTypeOptions, row.authType)
    },
    {
      label: "状态",
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(configStatusOptions, row.status)}>
          {dictLabel(configStatusOptions, row.status)}
        </el-tag>
      )
    },
    { label: "最近同步时间", prop: "lastSyncTime", minWidth: 140 },
    {
      label: "同步方向",
      minWidth: 130,
      cellRenderer: ({ row }) =>
        dictLabel(apiDirectionOptions, row.syncDirection)
    },
    { fixed: "right", label: "操作", width: 240, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getIntegrationConfigPage({
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

  /** 新增/编辑集成配置弹窗 */
  function openDialog(title: string, row?: IntegrationConfigItem) {
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
          systemName: row?.systemName ?? "",
          systemType: row?.systemType ?? "",
          apiUrl: row?.apiUrl ?? "",
          authType: row?.authType ?? "token",
          status: row?.status ?? "enabled",
          syncDirection: row?.syncDirection ?? "down"
        }
      },
      beforeSure: (done, { options }) => {
        const formInline = (
          options.props as { formInline: Partial<IntegrationConfigItem> }
        ).formInline;
        const req = formInline.id
          ? updateIntegrationConfig(formInline)
          : addIntegrationConfig(formInline);
        req.then(() => {
          message(formInline.id ? "修改成功" : "新增成功", { type: "success" });
          done();
          onSearch();
        });
      }
    });
  }

  /** 连接测试 */
  function handleTest(row: IntegrationConfigItem) {
    testIntegrationConfig(row.id).then(() => {
      message(`「${row.systemName}」连接成功`, { type: "success" });
      onSearch();
    });
  }

  function handleDelete(row: IntegrationConfigItem) {
    ElMessageBox.confirm(`确认删除集成配置「${row.systemName}」吗？`, "提示", {
      type: "warning"
    }).then(() => {
      deleteIntegrationConfig([row.id]).then(() => {
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
    handleTest,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

import { reactive, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { $t } from "@/plugins/i18n";
import { addDialog } from "@/components/ReDialog";
import {
  ReTableOperation,
  type TableOperationButton
} from "@/components/ReTableOperation";
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
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Connection from "~icons/ep/connection";
import formComp from "../form.vue";

export function useIntegrationConfig() {
  const form = reactive({
    systemName: "",
    systemType: "",
    status: ""
  });
  const loading = ref(false);
  const dataList = ref<IntegrationConfigItem[]>([]);

  /** 认证方式 */
  const authTypeOptions: DictItem[] = [
    { label: $t("integration.config.authToken"), value: "token" },
    { label: $t("integration.config.authSignature"), value: "signature" }
  ];

  /** 配置启停状态 */
  const configStatusOptions: DictItem[] = [
    {
      label: $t("common.buttons.enabled"),
      value: "enabled",
      tag: "success"
    },
    { label: $t("common.buttons.disabled"), value: "disabled", tag: "info" }
  ];

  const pagination = reactive({
    pageSize: 10,
    currentPage: 1,
    total: 0
  });

  const columns: TableColumnList = [
    {
      label: $t("integration.config.systemName"),
      prop: "systemName",
      minWidth: 120
    },
    {
      label: $t("integration.config.systemType"),
      minWidth: 100,
      cellRenderer: ({ row }) =>
        dictLabel(integrationTypeOptions, row.systemType)
    },
    {
      label: $t("integration.config.apiUrlCol"),
      prop: "apiUrl",
      minWidth: 180
    },
    {
      label: $t("integration.config.authType"),
      minWidth: 90,
      cellRenderer: ({ row }) => dictLabel(authTypeOptions, row.authType)
    },
    {
      label: $t("common.columns.status"),
      minWidth: 70,
      cellRenderer: ({ row }) => (
        <el-tag type={dictTag(configStatusOptions, row.status)}>
          {dictLabel(configStatusOptions, row.status)}
        </el-tag>
      )
    },
    {
      label: $t("integration.config.lastSyncTime"),
      prop: "lastSyncTime",
      minWidth: 140
    },
    {
      label: $t("integration.config.syncDirection"),
      minWidth: 130,
      cellRenderer: ({ row }) =>
        dictLabel(apiDirectionOptions, row.syncDirection)
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

  function operationButtons(
    row: IntegrationConfigItem
  ): TableOperationButton[] {
    return [
      {
        label: $t("common.buttons.test"),
        type: "success",
        icon: Connection,
        onClick: () => handleTest(row)
      },
      {
        label: $t("common.buttons.edit"),
        icon: EditPen,
        onClick: () => openDialog($t("integration.config.editTitle"), row)
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
          message(
            formInline.id
              ? $t("integration.config.editSuccess")
              : $t("integration.config.addSuccess"),
            { type: "success" }
          );
          done();
          onSearch();
        });
      }
    });
  }

  /** 连接测试 */
  function handleTest(row: IntegrationConfigItem) {
    testIntegrationConfig(row.id).then(() => {
      message($t("integration.config.testSuccess", { name: row.systemName }), {
        type: "success"
      });
      onSearch();
    });
  }

  function handleDelete(row: IntegrationConfigItem) {
    ElMessageBox.confirm(
      $t("integration.config.confirmDelete", { name: row.systemName }),
      $t("integration.config.tipTitle"),
      {
        type: "warning"
      }
    ).then(() => {
      deleteIntegrationConfig([row.id]).then(() => {
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
    configStatusOptions,
    onSearch,
    resetForm,
    openDialog,
    handleTest,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}

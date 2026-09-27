<script setup lang="ts">
import { reactive, ref } from "vue";
import { $t } from "@/plugins/i18n";
import type { FormRules } from "element-plus";
import type { IntegrationConfigItem } from "@/api/integration";
import { integrationTypeOptions, apiDirectionOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<IntegrationConfigItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  systemName: [
    {
      required: true,
      message: $t("integration.config.systemNameRequired"),
      trigger: "blur"
    }
  ],
  systemType: [
    {
      required: true,
      message: $t("integration.config.systemTypeRequired"),
      trigger: "change"
    }
  ],
  apiUrl: [
    {
      required: true,
      message: $t("integration.config.apiUrlRequired"),
      trigger: "blur"
    }
  ],
  authType: [
    {
      required: true,
      message: $t("integration.config.authTypeRequired"),
      trigger: "change"
    }
  ],
  syncDirection: [
    {
      required: true,
      message: $t("integration.config.syncDirectionRequired"),
      trigger: "change"
    }
  ]
};

const authTypeOptions = [
  { value: "token", label: $t("integration.config.authToken") },
  { value: "signature", label: $t("integration.config.authSignature") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item
      :label="$t('integration.config.systemName')"
      prop="systemName"
    >
      <el-input
        v-model="newFormInline.systemName"
        :placeholder="$t('integration.config.systemNameExample')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('integration.config.systemType')"
      prop="systemType"
    >
      <el-select
        v-model="newFormInline.systemType"
        :placeholder="$t('integration.config.systemTypeRequired')"
        style="width: 100%"
      >
        <el-option
          v-for="d in integrationTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('integration.config.apiUrl')" prop="apiUrl">
      <el-input
        v-model="newFormInline.apiUrl"
        :placeholder="$t('integration.config.apiUrlExample')"
      />
    </el-form-item>
    <el-form-item :label="$t('integration.config.authType')" prop="authType">
      <el-radio-group v-model="newFormInline.authType">
        <el-radio
          v-for="a in authTypeOptions"
          :key="a.value"
          :value="a.value"
          >{{ a.label }}</el-radio
        >
      </el-radio-group>
    </el-form-item>
    <el-form-item
      :label="$t('integration.config.syncDirection')"
      prop="syncDirection"
    >
      <el-select v-model="newFormInline.syncDirection" style="width: 100%">
        <el-option
          v-for="d in apiDirectionOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio value="enabled">{{ $t("common.buttons.enabled") }}</el-radio>
        <el-radio value="disabled">{{
          $t("common.buttons.disabled")
        }}</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

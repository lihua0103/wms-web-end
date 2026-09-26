<script setup lang="ts">
import { reactive, ref } from "vue";
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
  systemName: [{ required: true, message: "请输入系统名称", trigger: "blur" }],
  systemType: [
    { required: true, message: "请选择系统类型", trigger: "change" }
  ],
  apiUrl: [{ required: true, message: "请输入接口地址", trigger: "blur" }],
  authType: [{ required: true, message: "请选择认证方式", trigger: "change" }],
  syncDirection: [
    { required: true, message: "请选择同步方向", trigger: "change" }
  ]
};

const authTypeOptions = [
  { value: "token", label: "Token 令牌" },
  { value: "signature", label: "签名认证" }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="系统名称" prop="systemName">
      <el-input
        v-model="newFormInline.systemName"
        placeholder="如 用友 U8 ERP"
      />
    </el-form-item>
    <el-form-item label="系统类型" prop="systemType">
      <el-select
        v-model="newFormInline.systemType"
        placeholder="请选择系统类型"
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
    <el-form-item label="接口地址" prop="apiUrl">
      <el-input
        v-model="newFormInline.apiUrl"
        placeholder="如 https://erp.demo.com/api"
      />
    </el-form-item>
    <el-form-item label="认证方式" prop="authType">
      <el-radio-group v-model="newFormInline.authType">
        <el-radio
          v-for="a in authTypeOptions"
          :key="a.value"
          :value="a.value"
          >{{ a.label }}</el-radio
        >
      </el-radio-group>
    </el-form-item>
    <el-form-item label="同步方向" prop="syncDirection">
      <el-select v-model="newFormInline.syncDirection" style="width: 100%">
        <el-option
          v-for="d in apiDirectionOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio value="enabled">启用</el-radio>
        <el-radio value="disabled">停用</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

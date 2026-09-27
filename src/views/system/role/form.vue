<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { RoleItem } from "@/api/system";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<RoleItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [
    { required: true, message: $t("system.role.codeMsg"), trigger: "blur" }
  ],
  name: [{ required: true, message: $t("system.role.namePh"), trigger: "blur" }]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('system.role.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('system.role.codePh')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('system.role.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('system.role.namePh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.role.description')" prop="description">
      <el-input
        v-model="newFormInline.description"
        type="textarea"
        :placeholder="$t('system.role.descPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("common.buttons.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("common.buttons.disabled") }}</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

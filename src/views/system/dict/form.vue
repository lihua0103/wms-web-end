<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { DictTypeItem } from "@/api/system";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<DictTypeItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  name: [
    { required: true, message: $t("system.dict.namePh"), trigger: "blur" }
  ],
  code: [
    { required: true, message: $t("system.dict.codeMsg"), trigger: "blur" }
  ]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('system.dict.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('system.dict.namePh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.dict.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('system.dict.codePh')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.remark')" prop="remark">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        :placeholder="$t('common.columns.remark')"
      />
    </el-form-item>
  </el-form>
</template>

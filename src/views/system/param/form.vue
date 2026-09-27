<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { ParamItem } from "@/api/system";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<ParamItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  name: [
    { required: true, message: $t("system.param.namePh"), trigger: "blur" }
  ],
  key: [
    { required: true, message: $t("system.param.keyMsg"), trigger: "blur" }
  ],
  value: [
    { required: true, message: $t("system.param.valuePh"), trigger: "blur" }
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
    <el-form-item :label="$t('system.param.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('system.param.namePh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.param.key')" prop="key">
      <el-input
        v-model="newFormInline.key"
        :placeholder="$t('system.param.keyPh')"
        :disabled="newFormInline.builtIn === 1"
      />
      <span v-if="newFormInline.builtIn === 1" class="text-xs text-gray-400">
        {{ $t("system.param.builtInTip") }}
      </span>
    </el-form-item>
    <el-form-item :label="$t('system.param.value')" prop="value">
      <el-input
        v-model="newFormInline.value"
        :placeholder="$t('system.param.valuePh')"
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

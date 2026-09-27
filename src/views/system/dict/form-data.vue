<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { DictDataItem } from "@/api/system";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<DictDataItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  label: [
    { required: true, message: $t("system.dict.labelMsg"), trigger: "blur" }
  ],
  value: [
    { required: true, message: $t("system.dict.valueMsg"), trigger: "blur" }
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
    <el-form-item :label="$t('system.dict.type')" prop="dictCode">
      <el-input v-model="newFormInline.dictCode" disabled />
    </el-form-item>
    <el-form-item :label="$t('system.dict.label')" prop="label">
      <el-input
        v-model="newFormInline.label"
        :placeholder="$t('system.dict.labelPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.dict.value')" prop="value">
      <el-input
        v-model="newFormInline.value"
        :placeholder="$t('system.dict.valuePh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.dict.sort')" prop="sort">
      <el-input-number
        v-model="newFormInline.sort"
        :min="0"
        controls-position="right"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("common.buttons.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("common.buttons.disabled") }}</el-radio>
      </el-radio-group>
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

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { CustomerItem } from "@/api/master";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<CustomerItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [
    {
      required: true,
      message: $t("master.customer.codeRequired"),
      trigger: "blur"
    }
  ],
  name: [
    {
      required: true,
      message: $t("master.customer.nameRequired"),
      trigger: "blur"
    }
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
    <el-form-item :label="$t('master.customer.code')" prop="code">
      <el-input v-model="newFormInline.code" :disabled="!!newFormInline.id" />
    </el-form-item>
    <el-form-item :label="$t('master.customer.name')" prop="name">
      <el-input v-model="newFormInline.name" />
    </el-form-item>
    <el-form-item :label="$t('master.customer.contact')">
      <el-input v-model="newFormInline.contact" />
    </el-form-item>
    <el-form-item :label="$t('master.customer.phone')">
      <el-input v-model="newFormInline.phone" />
    </el-form-item>
    <el-form-item :label="$t('master.customer.address')">
      <el-input v-model="newFormInline.address" />
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("master.customer.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("master.customer.disabled") }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('common.columns.remark')">
      <el-input v-model="newFormInline.remark" type="textarea" />
    </el-form-item>
  </el-form>
</template>

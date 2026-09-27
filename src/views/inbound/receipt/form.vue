<script setup lang="ts">
import { reactive, ref } from "vue";
import { $t } from "@/plugins/i18n";
import type { FormRules } from "element-plus";

interface Props {
  formInline: {
    id: number;
    code: string;
    materialName: string;
    receivedQty: number;
    qualifiedQty: number;
    rejectedQty: number;
  };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  receivedQty: [
    {
      required: true,
      message: $t("inbound.receipt.plsInputReceivedQty"),
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
    <el-form-item :label="$t('inbound.receipt.receiptNo')">
      <el-input :model-value="newFormInline.code" disabled />
    </el-form-item>
    <el-form-item :label="$t('inbound.receipt.materialName')">
      <el-input :model-value="newFormInline.materialName" disabled />
    </el-form-item>
    <el-form-item :label="$t('inbound.receipt.receivedQty')" prop="receivedQty">
      <el-input-number
        v-model="newFormInline.receivedQty"
        :min="0"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item
      :label="$t('inbound.receipt.qualifiedQty')"
      prop="qualifiedQty"
    >
      <el-input-number
        v-model="newFormInline.qualifiedQty"
        :min="0"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('inbound.receipt.rejectedQty')" prop="rejectedQty">
      <el-input-number
        v-model="newFormInline.rejectedQty"
        :min="0"
        style="width: 100%"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { $t } from "@/plugins/i18n";
import type { FormRules } from "element-plus";
import { qcResultOptions } from "@/constants/wms";

interface Props {
  formInline: { id: number; code: string; qcResult: string; qcRemark: string };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  qcResult: [
    {
      required: true,
      message: $t("inbound.qc.plsSelectResult"),
      trigger: "change"
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
    <el-form-item :label="$t('inbound.qc.qcNo')">
      <el-input :model-value="newFormInline.code" disabled />
    </el-form-item>
    <el-form-item :label="$t('inbound.qc.qcResult')" prop="qcResult">
      <el-select v-model="newFormInline.qcResult" style="width: 100%">
        <el-option
          v-for="d in qcResultOptions.filter(o => o.value !== 'waiting')"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('inbound.qc.qcRemark')">
      <el-input
        v-model="newFormInline.qcRemark"
        type="textarea"
        :placeholder="$t('inbound.qc.qcRemarkPh')"
      />
    </el-form-item>
  </el-form>
</template>

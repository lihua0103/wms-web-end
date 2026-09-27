<script setup lang="ts">
import { reactive, ref } from "vue";
import { $t } from "@/plugins/i18n";
import type { FormRules } from "element-plus";

interface Props {
  formInline: { warehouseCode: string; carrierName: string };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [
    {
      required: true,
      message: $t("outbound.wave.warehouseRequired"),
      trigger: "change"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("outbound.wave.whShanghai") },
  { value: "WH002", label: $t("outbound.wave.whGuangzhou") },
  { value: "WH003", label: $t("outbound.wave.whChengdu") }
];

const carrierOptions = [
  { value: "顺丰速运", label: $t("outbound.wave.carrierSF") },
  { value: "京东物流", label: $t("outbound.wave.carrierJD") },
  { value: "德邦快递", label: $t("outbound.wave.carrierDeppon") },
  { value: "自有车队", label: $t("outbound.wave.carrierSelf") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('common.columns.warehouse')" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option
          v-for="w in warehouseOptions"
          :key="w.value"
          :label="w.label"
          :value="w.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('outbound.wave.carrier')">
      <el-select
        v-model="newFormInline.carrierName"
        :placeholder="$t('outbound.wave.carrierMergePh')"
        clearable
        style="width: 100%"
      >
        <el-option
          v-for="c in carrierOptions"
          :key="c.value"
          :label="c.label"
          :value="c.value"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

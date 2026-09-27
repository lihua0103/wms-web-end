<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { CarrierItem } from "@/api/transport";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<CarrierItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [
    {
      required: true,
      message: $t("transport.carrier.plsInputCode"),
      trigger: "blur"
    }
  ],
  name: [
    {
      required: true,
      message: $t("transport.carrier.plsInputName"),
      trigger: "blur"
    }
  ],
  carrierType: [
    {
      required: true,
      message: $t("transport.carrier.plsSelectType"),
      trigger: "change"
    }
  ]
};

const typeOptions = [
  { value: "self", label: $t("dict.carrierType.self") },
  { value: "third", label: $t("dict.carrierType.third") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="90px"
  >
    <el-form-item :label="$t('common.columns.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('transport.carrier.codePh')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('transport.carrier.name')"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.type')" prop="carrierType">
      <el-select v-model="newFormInline.carrierType" style="width: 100%">
        <el-option
          v-for="t in typeOptions"
          :key="t.value"
          :label="t.label"
          :value="t.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('transport.carrier.contact')">
      <el-input
        v-model="newFormInline.contact"
        :placeholder="$t('transport.carrier.contact')"
      />
    </el-form-item>
    <el-form-item :label="$t('transport.carrier.phone')">
      <el-input
        v-model="newFormInline.phone"
        :placeholder="$t('transport.carrier.phone')"
      />
    </el-form-item>
    <el-form-item :label="$t('transport.carrier.serviceArea')">
      <el-input
        v-model="newFormInline.serviceArea"
        :placeholder="$t('transport.carrier.serviceAreaPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('transport.carrier.settleType')">
      <el-select v-model="newFormInline.settleType" style="width: 100%">
        <el-option
          :label="$t('transport.carrier.settleMonthly')"
          value="月结"
        />
        <el-option
          :label="$t('transport.carrier.settleImmediate')"
          value="现结"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("common.buttons.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("common.buttons.disabled") }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('common.columns.remark')">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        :placeholder="$t('transport.carrier.remarkPh')"
      />
    </el-form-item>
  </el-form>
</template>

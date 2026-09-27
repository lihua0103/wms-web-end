<script setup lang="ts">
import { reactive, ref } from "vue";
import { $t } from "@/plugins/i18n";
import type { FormRules } from "element-plus";
import type { AsnItem } from "@/api/inbound";
import { inboundTypeOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<AsnItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [
    {
      required: true,
      message: $t("inbound.asn.plsSelectWarehouse"),
      trigger: "change"
    }
  ],
  supplierName: [
    {
      required: true,
      message: $t("inbound.asn.plsInputSupplier"),
      trigger: "blur"
    }
  ],
  expectedArrival: [
    {
      required: true,
      message: $t("inbound.asn.plsSelectArrival"),
      trigger: "change"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("inbound.asn.whShanghai") },
  { value: "WH002", label: $t("inbound.asn.whGuangzhou") },
  { value: "WH003", label: $t("inbound.asn.whChengdu") }
];

const ownerOptions = [
  { value: $t("inbound.asn.ownerA"), label: $t("inbound.asn.ownerA") },
  { value: $t("inbound.asn.ownerB"), label: $t("inbound.asn.ownerB") },
  { value: $t("inbound.asn.ownerC"), label: $t("inbound.asn.ownerC") },
  { value: $t("inbound.asn.ownerSelf"), label: $t("inbound.asn.ownerSelf") }
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
    <el-form-item :label="$t('common.columns.owner')">
      <el-select v-model="newFormInline.ownerName" style="width: 100%">
        <el-option
          v-for="o in ownerOptions"
          :key="o.value"
          :label="o.label"
          :value="o.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('inbound.asn.supplier')" prop="supplierName">
      <el-input
        v-model="newFormInline.supplierName"
        :placeholder="$t('inbound.asn.supplierPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('inbound.asn.inboundType')" prop="type">
      <el-select v-model="newFormInline.type" style="width: 100%">
        <el-option
          v-for="d in inboundTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      :label="$t('inbound.asn.expectedArrival')"
      prop="expectedArrival"
    >
      <el-date-picker
        v-model="newFormInline.expectedArrival"
        type="datetime"
        value-format="YYYY-MM-DD HH:mm:ss"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.remark')">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        :placeholder="$t('common.columns.remark')"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { $t } from "@/plugins/i18n";
import type { FormRules } from "element-plus";
import type { ReturnInboundItem } from "@/api/inbound";

interface Props {
  formInline: Partial<ReturnInboundItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [
    {
      required: true,
      message: $t("inbound.return.plsSelectWarehouse"),
      trigger: "change"
    }
  ],
  customerName: [
    {
      required: true,
      message: $t("inbound.return.plsInputCustomer"),
      trigger: "blur"
    }
  ],
  materialCode: [
    {
      required: true,
      message: $t("inbound.return.plsInputMaterialCode"),
      trigger: "blur"
    }
  ],
  qty: [
    {
      required: true,
      message: $t("inbound.return.plsInputQty"),
      trigger: "blur"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("inbound.return.whShanghai") },
  { value: "WH002", label: $t("inbound.return.whGuangzhou") },
  { value: "WH003", label: $t("inbound.return.whChengdu") }
];

const ownerOptions = [
  { value: $t("inbound.return.ownerA"), label: $t("inbound.return.ownerA") },
  { value: $t("inbound.return.ownerB"), label: $t("inbound.return.ownerB") },
  { value: $t("inbound.return.ownerC"), label: $t("inbound.return.ownerC") },
  {
    value: $t("inbound.return.ownerSelf"),
    label: $t("inbound.return.ownerSelf")
  }
];

const reasonOptions = [
  $t("inbound.return.reasonQuality"),
  $t("inbound.return.reasonWrongDelivery"),
  $t("inbound.return.reasonRejected"),
  $t("inbound.return.reasonDamaged"),
  $t("inbound.return.reasonExpired")
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
    <el-form-item :label="$t('inbound.return.customer')" prop="customerName">
      <el-input
        v-model="newFormInline.customerName"
        :placeholder="$t('inbound.return.customerPh')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('inbound.return.materialCode')"
      prop="materialCode"
    >
      <el-input
        v-model="newFormInline.materialCode"
        :placeholder="$t('inbound.return.materialCodePh')"
      />
    </el-form-item>
    <el-form-item :label="$t('inbound.return.materialName')">
      <el-input
        v-model="newFormInline.materialName"
        :placeholder="$t('inbound.return.materialName')"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.quantity')" prop="qty">
      <el-input-number
        v-model="newFormInline.qty"
        :min="1"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('inbound.return.reason')">
      <el-select v-model="newFormInline.reason" style="width: 100%">
        <el-option v-for="r in reasonOptions" :key="r" :label="r" :value="r" />
      </el-select>
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

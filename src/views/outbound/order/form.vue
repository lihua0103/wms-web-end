<script setup lang="ts">
import { reactive, ref } from "vue";
import { $t } from "@/plugins/i18n";
import type { FormRules } from "element-plus";
import type { OutboundOrderItem } from "@/api/outbound";
import { outboundTypeOptions, priorityOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<OutboundOrderItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [
    {
      required: true,
      message: $t("outbound.order.warehouseRequired"),
      trigger: "change"
    }
  ],
  customerName: [
    {
      required: true,
      message: $t("outbound.order.customerRequired"),
      trigger: "blur"
    }
  ],
  materialCode: [
    {
      required: true,
      message: $t("outbound.order.materialCodeRequired"),
      trigger: "blur"
    }
  ],
  qty: [
    {
      required: true,
      message: $t("outbound.order.qtyRequired"),
      trigger: "blur"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("outbound.order.whShanghai") },
  { value: "WH002", label: $t("outbound.order.whGuangzhou") },
  { value: "WH003", label: $t("outbound.order.whChengdu") }
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
    <el-form-item :label="$t('outbound.order.customer')" prop="customerName">
      <el-input
        v-model="newFormInline.customerName"
        :placeholder="$t('outbound.order.customerName')"
      />
    </el-form-item>
    <el-form-item :label="$t('outbound.order.typeLabel')" prop="type">
      <el-select v-model="newFormInline.type" style="width: 100%">
        <el-option
          v-for="d in outboundTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('outbound.order.priority')" prop="priority">
      <el-select v-model="newFormInline.priority" style="width: 100%">
        <el-option
          v-for="d in priorityOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      :label="$t('outbound.order.materialCode')"
      prop="materialCode"
    >
      <el-input
        v-model="newFormInline.materialCode"
        :placeholder="$t('outbound.order.materialCodePh')"
      />
    </el-form-item>
    <el-form-item :label="$t('outbound.order.materialName')">
      <el-input
        v-model="newFormInline.materialName"
        :placeholder="$t('outbound.order.materialName')"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.quantity')" prop="qty">
      <el-input-number
        v-model="newFormInline.qty"
        :min="1"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('outbound.order.deliveryDate')">
      <el-date-picker
        v-model="newFormInline.deliveryDate"
        type="date"
        value-format="YYYY-MM-DD"
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

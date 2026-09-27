<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: {
    id: number;
    code: string;
    carrierName: string;
    vehicleNo: string;
    driverName: string;
  };
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  carrierName: [
    {
      required: true,
      message: $t("transport.dispatch.plsSelectCarrier"),
      trigger: "change"
    }
  ],
  vehicleNo: [
    {
      required: true,
      message: $t("transport.dispatch.plsInputVehicleNo"),
      trigger: "blur"
    }
  ],
  driverName: [
    {
      required: true,
      message: $t("transport.dispatch.plsInputDriver"),
      trigger: "blur"
    }
  ]
};

const carrierOptions = [
  { value: "顺丰速运", label: $t("transport.dispatch.carrierSf") },
  { value: "京东物流", label: $t("transport.dispatch.carrierJd") },
  { value: "德邦快递", label: $t("transport.dispatch.carrierDeppon") },
  { value: "自有车队", label: $t("transport.dispatch.carrierOwnFleet") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="90px"
  >
    <el-form-item :label="$t('transport.dispatch.deliveryNo')">
      <el-input :model-value="newFormInline.code" disabled />
    </el-form-item>
    <el-form-item :label="$t('transport.dispatch.carrier')" prop="carrierName">
      <el-select v-model="newFormInline.carrierName" style="width: 100%">
        <el-option
          v-for="c in carrierOptions"
          :key="c.value"
          :label="c.label"
          :value="c.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      :label="$t('transport.dispatch.licensePlate')"
      prop="vehicleNo"
    >
      <el-input
        v-model="newFormInline.vehicleNo"
        :placeholder="$t('transport.dispatch.vehicleNoPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('transport.dispatch.driver')" prop="driverName">
      <el-input
        v-model="newFormInline.driverName"
        :placeholder="$t('transport.dispatch.driverPh')"
      />
    </el-form-item>
  </el-form>
</template>

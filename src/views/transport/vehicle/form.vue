<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { VehicleItem } from "@/api/transport";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<VehicleItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  vehicleNo: [
    {
      required: true,
      message: $t("transport.vehicle.plsInputVehicleNo"),
      trigger: "blur"
    }
  ],
  driverName: [
    {
      required: true,
      message: $t("transport.vehicle.plsInputDriver"),
      trigger: "blur"
    }
  ]
};

const carrierOptions = [
  { value: "顺丰速运", label: $t("transport.vehicle.carrierSf") },
  { value: "京东物流", label: $t("transport.vehicle.carrierJd") },
  { value: "德邦快递", label: $t("transport.vehicle.carrierDeppon") },
  { value: "自有车队", label: $t("transport.vehicle.carrierOwnFleet") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="90px"
  >
    <el-form-item
      :label="$t('transport.vehicle.licensePlate')"
      prop="vehicleNo"
    >
      <el-input
        v-model="newFormInline.vehicleNo"
        :placeholder="$t('transport.vehicle.vehicleNoPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('transport.vehicle.driver')" prop="driverName">
      <el-input
        v-model="newFormInline.driverName"
        :placeholder="$t('transport.vehicle.driverPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('transport.vehicle.phone')">
      <el-input
        v-model="newFormInline.phone"
        :placeholder="$t('transport.vehicle.phonePh')"
      />
    </el-form-item>
    <el-form-item :label="$t('transport.vehicle.vehicleType')">
      <el-select v-model="newFormInline.vehicleType" style="width: 100%">
        <el-option :label="$t('transport.vehicle.typeBox')" value="厢式" />
        <el-option :label="$t('transport.vehicle.typeFlat')" value="平板" />
        <el-option
          :label="$t('transport.vehicle.typeRefrigerated')"
          value="冷藏"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('transport.vehicle.loadTon')">
      <el-input-number
        v-model="newFormInline.maxLoad"
        :min="1"
        :max="50"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('transport.vehicle.carrier')">
      <el-select v-model="newFormInline.carrierName" style="width: 100%">
        <el-option
          v-for="c in carrierOptions"
          :key="c.value"
          :label="c.label"
          :value="c.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')">
      <el-radio-group v-model="newFormInline.status">
        <el-radio value="空闲">{{
          $t("transport.vehicle.statusIdle")
        }}</el-radio>
        <el-radio value="在途">{{
          $t("transport.vehicle.statusOnRoute")
        }}</el-radio>
        <el-radio value="维修">{{
          $t("transport.vehicle.statusRepair")
        }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('common.columns.remark')">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        :placeholder="$t('transport.vehicle.remarkPh')"
      />
    </el-form-item>
  </el-form>
</template>

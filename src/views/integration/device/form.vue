<script setup lang="ts">
import { reactive, ref } from "vue";
import { $t } from "@/plugins/i18n";
import type { FormRules } from "element-plus";
import type { DeviceItem } from "@/api/integration";
import { deviceTypeOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<DeviceItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [
    {
      required: true,
      message: $t("integration.device.codeRequired"),
      trigger: "blur"
    }
  ],
  name: [
    {
      required: true,
      message: $t("integration.device.nameRequired"),
      trigger: "blur"
    }
  ],
  deviceType: [
    {
      required: true,
      message: $t("integration.device.typeRequired"),
      trigger: "change"
    }
  ],
  warehouseCode: [
    {
      required: true,
      message: $t("integration.device.warehouseRequired"),
      trigger: "change"
    }
  ],
  ip: [
    {
      required: true,
      message: $t("integration.device.ipRequired"),
      trigger: "blur"
    },
    {
      pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
      message: $t("integration.device.ipInvalid"),
      trigger: "blur"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("integration.device.wh001") },
  { value: "WH002", label: $t("integration.device.wh002") },
  { value: "WH003", label: $t("integration.device.wh003") }
];

const zoneOptions = [
  { value: "A", label: $t("integration.device.zoneA") },
  { value: "B", label: $t("integration.device.zoneB") },
  { value: "C", label: $t("integration.device.zoneC") },
  { value: "D", label: $t("integration.device.zoneD") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('integration.device.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('integration.device.codeExample')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('integration.device.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('integration.device.nameRequired')"
      />
    </el-form-item>
    <el-form-item :label="$t('integration.device.type')" prop="deviceType">
      <el-select
        v-model="newFormInline.deviceType"
        :placeholder="$t('integration.device.typeRequired')"
        style="width: 100%"
      >
        <el-option
          v-for="d in deviceTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      :label="$t('integration.device.warehouse')"
      prop="warehouseCode"
    >
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option
          v-for="w in warehouseOptions"
          :key="w.value"
          :label="w.label"
          :value="w.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('integration.device.zone')" prop="zoneCode">
      <el-select
        v-model="newFormInline.zoneCode"
        :placeholder="$t('integration.device.zonePh')"
        clearable
        style="width: 100%"
      >
        <el-option
          v-for="z in zoneOptions"
          :key="z.value"
          :label="z.label"
          :value="z.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('integration.device.ip')" prop="ip">
      <el-input
        v-model="newFormInline.ip"
        :placeholder="$t('integration.device.ipExample')"
      />
    </el-form-item>
    <el-form-item :label="$t('integration.device.vendor')" prop="vendor">
      <el-input
        v-model="newFormInline.vendor"
        :placeholder="$t('integration.device.vendorPh')"
      />
    </el-form-item>
  </el-form>
</template>

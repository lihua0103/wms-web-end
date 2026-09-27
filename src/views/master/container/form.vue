<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { ContainerItem } from "@/api/master";
import { $t } from "@/plugins/i18n";
import { containerTypeOptions, containerStatusOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<ContainerItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [
    {
      required: true,
      message: $t("master.container.codeRequired"),
      trigger: "blur"
    }
  ],
  containerType: [
    {
      required: true,
      message: $t("master.container.typeRequired"),
      trigger: "change"
    }
  ],
  warehouseCode: [
    {
      required: true,
      message: $t("master.container.selectWarehouse"),
      trigger: "change"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("master.container.wh001") },
  { value: "WH002", label: $t("master.container.wh002") },
  { value: "WH003", label: $t("master.container.wh003") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('master.container.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('master.container.codeExample')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item
      :label="$t('master.container.containerType')"
      prop="containerType"
    >
      <el-select v-model="newFormInline.containerType" style="width: 100%">
        <el-option
          v-for="d in containerTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
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
    <el-form-item :label="$t('common.columns.status')">
      <el-select v-model="newFormInline.status" style="width: 100%">
        <el-option
          v-for="d in containerStatusOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('master.container.bindingMaterial')">
      <el-input
        v-model="newFormInline.materialCode"
        :placeholder="$t('master.container.bindingMaterialPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.container.currentLocation')">
      <el-input
        v-model="newFormInline.locationCode"
        :placeholder="$t('master.container.currentLocationPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.remark')">
      <el-input v-model="newFormInline.remark" type="textarea" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { LocationItem } from "@/api/master";
import { $t } from "@/plugins/i18n";
import { locationTypeOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<LocationItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [
    {
      required: true,
      message: $t("master.location.selectWarehouse"),
      trigger: "change"
    }
  ],
  zoneCode: [
    {
      required: true,
      message: $t("master.location.zoneCodeRequired"),
      trigger: "blur"
    }
  ],
  code: [
    {
      required: true,
      message: $t("master.location.codeRequired"),
      trigger: "blur"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("master.location.wh001") },
  { value: "WH002", label: $t("master.location.wh002") },
  { value: "WH003", label: $t("master.location.wh003") }
];

const statusOptions = [
  { value: "idle", label: $t("master.location.statusIdle") },
  { value: "occupied", label: $t("master.location.statusOccupied") },
  { value: "disabled", label: $t("master.location.statusDisabled") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="110px"
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
    <el-form-item :label="$t('master.location.zoneCode')" prop="zoneCode">
      <el-input
        v-model="newFormInline.zoneCode"
        :placeholder="$t('master.location.zoneCodeExample')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.location.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('master.location.codeExample')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('master.location.type')">
      <el-select v-model="newFormInline.locationType" style="width: 100%">
        <el-option
          v-for="d in locationTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('master.location.maxWeight')">
      <el-input-number
        v-model="newFormInline.maxWeight"
        :min="0"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('master.location.maxVolume')">
      <el-input-number
        v-model="newFormInline.maxVolume"
        :min="0"
        :precision="1"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('master.location.isMix')">
      <el-radio-group v-model="newFormInline.isMix">
        <el-radio :value="1">{{ $t("master.location.allow") }}</el-radio>
        <el-radio :value="0">{{ $t("master.location.forbid") }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')">
      <el-select v-model="newFormInline.status" style="width: 100%">
        <el-option
          v-for="s in statusOptions"
          :key="s.value"
          :label="s.label"
          :value="s.value"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

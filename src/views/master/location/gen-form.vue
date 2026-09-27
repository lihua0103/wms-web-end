<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: {
    warehouseCode: string;
    zoneCode: string;
    prefix: string;
    row: number;
    col: number;
    floor: number;
  };
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
  prefix: [
    {
      required: true,
      message: $t("master.location.prefixRequired"),
      trigger: "blur"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("master.location.wh001") },
  { value: "WH002", label: $t("master.location.wh002") },
  { value: "WH003", label: $t("master.location.wh003") }
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
    <el-form-item :label="$t('master.location.zoneCode')" prop="zoneCode">
      <el-input
        v-model="newFormInline.zoneCode"
        :placeholder="$t('master.location.zoneCodeExample')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.location.prefix')" prop="prefix">
      <el-input
        v-model="newFormInline.prefix"
        :placeholder="$t('master.location.prefixPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.location.rows')">
      <el-input-number
        v-model="newFormInline.row"
        :min="1"
        :max="50"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('master.location.cols')">
      <el-input-number
        v-model="newFormInline.col"
        :min="1"
        :max="50"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('master.location.floors')">
      <el-input-number
        v-model="newFormInline.floor"
        :min="1"
        :max="10"
        style="width: 100%"
      />
    </el-form-item>
  </el-form>
</template>

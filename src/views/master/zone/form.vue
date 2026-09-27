<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { ZoneItem } from "@/api/master";
import { $t } from "@/plugins/i18n";
import { zoneTypeOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<ZoneItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [
    {
      required: true,
      message: $t("master.zone.selectWarehouse"),
      trigger: "change"
    }
  ],
  code: [
    { required: true, message: $t("master.zone.codeRequired"), trigger: "blur" }
  ],
  name: [
    { required: true, message: $t("master.zone.nameRequired"), trigger: "blur" }
  ],
  zoneType: [
    {
      required: true,
      message: $t("master.zone.typeRequired"),
      trigger: "change"
    }
  ]
};

const warehouseOptions = [
  { value: "WH001", label: $t("master.zone.wh001") },
  { value: "WH002", label: $t("master.zone.wh002") },
  { value: "WH003", label: $t("master.zone.wh003") }
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
    <el-form-item :label="$t('master.zone.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('master.zone.codeExample')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('master.zone.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('master.zone.name')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.zone.type')" prop="zoneType">
      <el-select v-model="newFormInline.zoneType" style="width: 100%">
        <el-option
          v-for="d in zoneTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("master.zone.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("master.zone.disabled") }}</el-radio>
      </el-radio-group>
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

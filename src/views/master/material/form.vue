<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { MaterialItem } from "@/api/master";
import { $t } from "@/plugins/i18n";
import { materialCategoryOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<MaterialItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [
    {
      required: true,
      message: $t("master.material.codeRequired"),
      trigger: "blur"
    }
  ],
  name: [
    {
      required: true,
      message: $t("master.material.nameRequired"),
      trigger: "blur"
    }
  ],
  category: [
    {
      required: true,
      message: $t("master.material.categoryRequired"),
      trigger: "change"
    }
  ]
};

const ownerOptions = [
  { value: $t("master.material.ownerA"), label: $t("master.material.ownerA") },
  { value: $t("master.material.ownerB"), label: $t("master.material.ownerB") },
  { value: $t("master.material.ownerC"), label: $t("master.material.ownerC") },
  {
    value: $t("master.material.selfOwned"),
    label: $t("master.material.selfOwned")
  }
];

const unitOptions = [
  $t("master.material.unitPiece"),
  $t("master.material.unitBox"),
  $t("master.material.unitPallet"),
  $t("master.material.unitMeter"),
  $t("master.material.unitKg")
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="110px"
  >
    <el-form-item :label="$t('master.material.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('master.material.codeExample')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('master.material.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('master.material.name')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.material.category')" prop="category">
      <el-select v-model="newFormInline.category" style="width: 100%">
        <el-option
          v-for="d in materialCategoryOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('master.material.spec')">
      <el-input
        v-model="newFormInline.spec"
        :placeholder="$t('master.material.specPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.unit')">
      <el-select v-model="newFormInline.unit" style="width: 100%">
        <el-option v-for="u in unitOptions" :key="u" :label="u" :value="u" />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('master.material.barcode')">
      <el-input
        v-model="newFormInline.barcode"
        :placeholder="$t('master.material.barcodePh')"
      />
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
    <el-form-item :label="$t('master.material.expiryMgmt')">
      <el-radio-group v-model="newFormInline.isExpiry">
        <el-radio :value="1">{{ $t("master.material.yes") }}</el-radio>
        <el-radio :value="0">{{ $t("master.material.no") }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('master.material.serialMgmt')">
      <el-radio-group v-model="newFormInline.isSerial">
        <el-radio :value="1">{{ $t("master.material.yes") }}</el-radio>
        <el-radio :value="0">{{ $t("master.material.no") }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('master.material.safetyQty')">
      <el-input-number
        v-model="newFormInline.safetyQty"
        :min="0"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('master.material.priceYuan')">
      <el-input-number
        v-model="newFormInline.price"
        :min="0"
        :precision="2"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("master.material.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("master.material.disabled") }}</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

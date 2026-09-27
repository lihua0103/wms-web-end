<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { WarehouseItem } from "@/api/master";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<WarehouseItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [
    {
      required: true,
      message: $t("master.warehouse.codeRequired"),
      trigger: "blur"
    }
  ],
  name: [
    {
      required: true,
      message: $t("master.warehouse.nameRequired"),
      trigger: "blur"
    }
  ]
};

const typeOptions = [
  { value: "normal", label: $t("master.warehouse.typeNormal") },
  { value: "cold", label: $t("master.warehouse.typeCold") },
  { value: "dangerous", label: $t("master.warehouse.typeDangerous") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('master.warehouse.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('master.warehouse.codeExample')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('master.warehouse.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('master.warehouse.name')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.warehouse.type')" prop="type">
      <el-select v-model="newFormInline.type" style="width: 100%">
        <el-option
          v-for="t in typeOptions"
          :key="t.value"
          :label="t.label"
          :value="t.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('master.warehouse.address')">
      <el-input
        v-model="newFormInline.address"
        :placeholder="$t('master.warehouse.addressPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.warehouse.contact')">
      <el-input
        v-model="newFormInline.contact"
        :placeholder="$t('master.warehouse.contact')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.warehouse.phone')">
      <el-input
        v-model="newFormInline.phone"
        :placeholder="$t('master.warehouse.phone')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.warehouse.area')">
      <el-input-number
        v-model="newFormInline.area"
        :min="0"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("master.warehouse.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("master.warehouse.disabled") }}</el-radio>
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

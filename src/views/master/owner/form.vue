<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { OwnerItem } from "@/api/master";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<OwnerItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [
    {
      required: true,
      message: $t("master.owner.codeRequired"),
      trigger: "blur"
    }
  ],
  name: [
    {
      required: true,
      message: $t("master.owner.nameRequired"),
      trigger: "blur"
    }
  ]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('master.owner.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('master.owner.codeExample')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('master.owner.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('master.owner.name')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.owner.contact')">
      <el-input
        v-model="newFormInline.contact"
        :placeholder="$t('master.owner.contact')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.owner.phone')">
      <el-input
        v-model="newFormInline.phone"
        :placeholder="$t('master.owner.phone')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.owner.address')">
      <el-input
        v-model="newFormInline.address"
        :placeholder="$t('master.owner.address')"
      />
    </el-form-item>
    <el-form-item :label="$t('master.owner.settleType')">
      <el-select v-model="newFormInline.settleType" style="width: 100%">
        <el-option
          :label="$t('master.owner.settleMonthly')"
          :value="$t('master.owner.settleMonthly')"
        />
        <el-option
          :label="$t('master.owner.settleImmediate')"
          :value="$t('master.owner.settleImmediate')"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("master.owner.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("master.owner.disabled") }}</el-radio>
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

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { FeeRuleItem } from "@/api/billing";
import { feeTypeOptions } from "@/constants/wms";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<FeeRuleItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [
    {
      required: true,
      message: $t("billing.rule.codeRequired"),
      trigger: "blur"
    }
  ],
  ownerName: [
    {
      required: true,
      message: $t("billing.rule.ownerRequired"),
      trigger: "change"
    }
  ],
  feeType: [
    {
      required: true,
      message: $t("billing.rule.feeTypeRequired"),
      trigger: "change"
    }
  ],
  unit: [
    {
      required: true,
      message: $t("billing.rule.unitRequired"),
      trigger: "change"
    }
  ],
  effectiveFrom: [
    {
      required: true,
      message: $t("billing.rule.effectiveFromRequired"),
      trigger: "change"
    }
  ]
};

// value 为 mock 数据匹配值，保持原文；label 为展示文案
const ownerOptions = [
  { value: "货主A 华东电子", label: $t("billing.rule.ownerA") },
  { value: "货主B 精工机械", label: $t("billing.rule.ownerB") },
  { value: "货主C 日化用品", label: $t("billing.rule.ownerC") },
  { value: "自营", label: $t("billing.rule.selfOwned") }
];

const unitOptions = [
  { value: "托/天", label: $t("billing.rule.unitPalletDay") },
  { value: "件", label: $t("billing.rule.unitPiece") },
  { value: "次", label: $t("billing.rule.unitTime") },
  { value: "票", label: $t("billing.rule.unitTicket") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('billing.rule.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('billing.rule.codeRequired')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.owner')" prop="ownerName">
      <el-select
        v-model="newFormInline.ownerName"
        :placeholder="$t('billing.rule.ownerRequired')"
        style="width: 100%"
      >
        <el-option
          v-for="o in ownerOptions"
          :key="o.value"
          :label="o.label"
          :value="o.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('billing.rule.feeType')" prop="feeType">
      <el-select
        v-model="newFormInline.feeType"
        :placeholder="$t('billing.rule.feeTypeRequired')"
        style="width: 100%"
      >
        <el-option
          v-for="d in feeTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('billing.rule.unit')" prop="unit">
      <el-select
        v-model="newFormInline.unit"
        :placeholder="$t('billing.rule.unitRequired')"
        style="width: 100%"
      >
        <el-option
          v-for="u in unitOptions"
          :key="u.value"
          :label="u.label"
          :value="u.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('billing.rule.price')" prop="price">
      <el-input-number
        v-model="newFormInline.price"
        :min="0"
        :precision="2"
        :step="0.5"
        controls-position="right"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('billing.rule.minimumFee')" prop="minimumFee">
      <el-input-number
        v-model="newFormInline.minimumFee"
        :min="0"
        :precision="2"
        :step="50"
        controls-position="right"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item
      :label="$t('billing.rule.effectiveFrom')"
      prop="effectiveFrom"
    >
      <el-date-picker
        v-model="newFormInline.effectiveFrom"
        type="date"
        value-format="YYYY-MM-DD"
        :placeholder="$t('billing.rule.effectiveFromRequired')"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('billing.rule.effectiveTo')" prop="effectiveTo">
      <el-date-picker
        v-model="newFormInline.effectiveTo"
        type="date"
        value-format="YYYY-MM-DD"
        :placeholder="$t('billing.rule.effectiveToRequired')"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("common.buttons.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("common.buttons.disabled") }}</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

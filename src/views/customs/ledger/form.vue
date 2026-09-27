<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { CustomsLedgerItem } from "@/api/customs";
import { $t } from "@/plugins/i18n";
import {
  customsLedgerTypeOptions,
  customsLedgerStatusOptions,
  supervisionModeOptions
} from "@/constants/wms";

interface Props {
  formInline: Partial<CustomsLedgerItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  ledgerNo: [
    {
      required: true,
      message: $t("customs.ledger.inputLedgerNo"),
      trigger: "blur"
    }
  ],
  ledgerType: [
    {
      required: true,
      message: $t("customs.ledger.selectLedgerType"),
      trigger: "change"
    }
  ],
  enterpriseName: [
    {
      required: true,
      message: $t("customs.ledger.inputEnterpriseName"),
      trigger: "blur"
    }
  ],
  customsCode: [
    {
      required: true,
      message: $t("customs.ledger.inputCustomsCode"),
      trigger: "blur"
    }
  ],
  supervisionMode: [
    {
      required: true,
      message: $t("customs.ledger.selectSupervisionMode"),
      trigger: "change"
    }
  ],
  validFrom: [
    {
      required: true,
      message: $t("customs.ledger.selectValidFrom"),
      trigger: "change"
    }
  ],
  validTo: [
    {
      required: true,
      message: $t("customs.ledger.selectValidTo"),
      trigger: "change"
    }
  ]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="110px"
  >
    <el-form-item :label="$t('customs.ledger.ledgerNo')" prop="ledgerNo">
      <el-input
        v-model="newFormInline.ledgerNo"
        :placeholder="$t('customs.ledger.ledgerNoPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('customs.ledger.ledgerType')" prop="ledgerType">
      <el-select
        v-model="newFormInline.ledgerType"
        :placeholder="$t('customs.ledger.selectLedgerType')"
        style="width: 100%"
      >
        <el-option
          v-for="d in customsLedgerTypeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      :label="$t('customs.ledger.enterpriseName')"
      prop="enterpriseName"
    >
      <el-input
        v-model="newFormInline.enterpriseName"
        :placeholder="$t('customs.ledger.enterpriseNameFullPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('customs.ledger.customsCode')" prop="customsCode">
      <el-input
        v-model="newFormInline.customsCode"
        :placeholder="$t('customs.ledger.customsCodePh')"
        maxlength="10"
      />
    </el-form-item>
    <el-form-item :label="$t('customs.ledger.creditCode')" prop="creditCode">
      <el-input
        v-model="newFormInline.creditCode"
        :placeholder="$t('customs.ledger.creditCodePh')"
        maxlength="18"
      />
    </el-form-item>
    <el-form-item
      :label="$t('customs.ledger.supervisionMode')"
      prop="supervisionMode"
    >
      <el-select
        v-model="newFormInline.supervisionMode"
        :placeholder="$t('customs.ledger.selectSupervisionMode')"
        style="width: 100%"
      >
        <el-option
          v-for="d in supervisionModeOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('customs.ledger.validFrom')" prop="validFrom">
      <el-date-picker
        v-model="newFormInline.validFrom"
        type="date"
        value-format="YYYY-MM-DD"
        :placeholder="$t('customs.ledger.pickValidFrom')"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('customs.ledger.validTo')" prop="validTo">
      <el-date-picker
        v-model="newFormInline.validTo"
        type="date"
        value-format="YYYY-MM-DD"
        :placeholder="$t('customs.ledger.pickValidTo')"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio
          v-for="d in customsLedgerStatusOptions"
          :key="d.value"
          :value="d.value"
          >{{ d.label }}</el-radio
        >
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('common.columns.remark')" prop="remark">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        :rows="2"
        :placeholder="$t('customs.ledger.remarkPh')"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { MoveItem } from "@/api/inventory";
import { moveTypeOptions } from "@/constants/wms";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<MoveItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  moveType: [
    {
      required: true,
      message: $t("inventory.move.selectMoveType"),
      trigger: "change"
    }
  ],
  warehouseCode: [
    {
      required: true,
      message: $t("inventory.move.selectWarehouse"),
      trigger: "change"
    }
  ],
  materialCode: [
    {
      required: true,
      message: $t("inventory.move.materialCodeRequired"),
      trigger: "blur"
    }
  ],
  fromLocation: [
    {
      required: true,
      message: $t("inventory.move.fromLocationRequired"),
      trigger: "blur"
    }
  ],
  toLocation: [
    {
      required: true,
      message: $t("inventory.move.toLocationRequired"),
      trigger: "blur"
    }
  ],
  qty: [{ required: true, message: $t("inventory.move.qtyRequired") }]
};

const warehouseOptions = [
  { value: "WH001", label: $t("inventory.move.whShanghai") },
  { value: "WH002", label: $t("inventory.move.whGuangzhou") },
  { value: "WH003", label: $t("inventory.move.whChengdu") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('inventory.move.moveType')" prop="moveType">
      <el-select v-model="newFormInline.moveType" style="width: 100%">
        <el-option
          v-for="d in moveTypeOptions"
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
    <el-form-item
      :label="$t('inventory.move.materialCode')"
      prop="materialCode"
    >
      <el-input
        v-model="newFormInline.materialCode"
        :placeholder="$t('inventory.move.materialCodeExample')"
      />
    </el-form-item>
    <el-form-item
      :label="$t('inventory.move.materialName')"
      prop="materialName"
    >
      <el-input v-model="newFormInline.materialName" />
    </el-form-item>
    <el-form-item :label="$t('inventory.move.batch')" prop="batchNo">
      <el-input v-model="newFormInline.batchNo" />
    </el-form-item>
    <el-form-item
      :label="$t('inventory.move.fromLocation')"
      prop="fromLocation"
    >
      <el-input
        v-model="newFormInline.fromLocation"
        :placeholder="$t('inventory.move.locationExample')"
      />
    </el-form-item>
    <el-form-item :label="$t('inventory.move.toLocation')" prop="toLocation">
      <el-input
        v-model="newFormInline.toLocation"
        :placeholder="$t('inventory.move.locationExample')"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.quantity')" prop="qty">
      <el-input-number
        v-model="newFormInline.qty"
        :min="1"
        controls-position="right"
        style="width: 100%"
      />
    </el-form-item>
  </el-form>
</template>

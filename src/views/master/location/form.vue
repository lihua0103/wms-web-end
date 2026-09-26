<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { LocationItem } from "@/api/master";
import { locationTypeOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<LocationItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [{ required: true, message: "请选择仓库", trigger: "change" }],
  zoneCode: [{ required: true, message: "请输入库区编码", trigger: "blur" }],
  code: [{ required: true, message: "请输入库位编码", trigger: "blur" }]
};

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];

const statusOptions = [
  { value: "idle", label: "空闲" },
  { value: "occupied", label: "占用" },
  { value: "disabled", label: "禁用" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="110px">
    <el-form-item label="仓库" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="库区编码" prop="zoneCode">
      <el-input v-model="newFormInline.zoneCode" placeholder="如 1Z01" />
    </el-form-item>
    <el-form-item label="库位编码" prop="code">
      <el-input v-model="newFormInline.code" placeholder="如 1Z01-01-02-3" :disabled="!!newFormInline.id" />
    </el-form-item>
    <el-form-item label="库位类型">
      <el-select v-model="newFormInline.locationType" style="width: 100%">
        <el-option v-for="d in locationTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="最大承重(kg)">
      <el-input-number v-model="newFormInline.maxWeight" :min="0" style="width: 100%" />
    </el-form-item>
    <el-form-item label="最大容积(m³)">
      <el-input-number v-model="newFormInline.maxVolume" :min="0" :precision="1" style="width: 100%" />
    </el-form-item>
    <el-form-item label="是否混放">
      <el-radio-group v-model="newFormInline.isMix">
        <el-radio :value="1">允许</el-radio>
        <el-radio :value="0">禁止</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="状态">
      <el-select v-model="newFormInline.status" style="width: 100%">
        <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { ZoneItem } from "@/api/master";
import { zoneTypeOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<ZoneItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  warehouseCode: [{ required: true, message: "请选择仓库", trigger: "change" }],
  code: [{ required: true, message: "请输入库区编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入库区名称", trigger: "blur" }],
  zoneType: [{ required: true, message: "请选择库区类型", trigger: "change" }]
};

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="仓库" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="库区编码" prop="code">
      <el-input v-model="newFormInline.code" placeholder="如 1Z01" :disabled="!!newFormInline.id" />
    </el-form-item>
    <el-form-item label="库区名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="库区名称" />
    </el-form-item>
    <el-form-item label="库区类型" prop="zoneType">
      <el-select v-model="newFormInline.zoneType" style="width: 100%">
        <el-option v-for="d in zoneTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="状态">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="0">停用</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model="newFormInline.remark" type="textarea" placeholder="备注" />
    </el-form-item>
  </el-form>
</template>

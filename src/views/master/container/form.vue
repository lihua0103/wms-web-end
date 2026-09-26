<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { ContainerItem } from "@/api/master";
import { containerTypeOptions, containerStatusOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<ContainerItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [{ required: true, message: "请输入容器编码", trigger: "blur" }],
  containerType: [{ required: true, message: "请选择容器类型", trigger: "change" }],
  warehouseCode: [{ required: true, message: "请选择仓库", trigger: "change" }]
};

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="容器编码" prop="code">
      <el-input v-model="newFormInline.code" placeholder="如 PLT00001" :disabled="!!newFormInline.id" />
    </el-form-item>
    <el-form-item label="容器类型" prop="containerType">
      <el-select v-model="newFormInline.containerType" style="width: 100%">
        <el-option v-for="d in containerTypeOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="仓库" prop="warehouseCode">
      <el-select v-model="newFormInline.warehouseCode" style="width: 100%">
        <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="状态">
      <el-select v-model="newFormInline.status" style="width: 100%">
        <el-option v-for="d in containerStatusOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="绑定物料">
      <el-input v-model="newFormInline.materialCode" placeholder="绑定物料编码（可空）" />
    </el-form-item>
    <el-form-item label="所在库位">
      <el-input v-model="newFormInline.locationCode" placeholder="所在库位（可空）" />
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model="newFormInline.remark" type="textarea" />
    </el-form-item>
  </el-form>
</template>

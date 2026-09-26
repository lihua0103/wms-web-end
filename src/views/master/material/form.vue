<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { MaterialItem } from "@/api/master";
import { materialCategoryOptions } from "@/constants/wms";

interface Props {
  formInline: Partial<MaterialItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [{ required: true, message: "请输入物料编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入物料名称", trigger: "blur" }],
  category: [{ required: true, message: "请选择分类", trigger: "change" }]
};

const ownerOptions = [
  { value: "货主A 华东电子", label: "货主A 华东电子" },
  { value: "货主B 精工机械", label: "货主B 精工机械" },
  { value: "货主C 日化用品", label: "货主C 日化用品" },
  { value: "自营", label: "自营" }
];

const unitOptions = ["件", "箱", "托", "米", "千克"];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="110px">
    <el-form-item label="物料编码" prop="code">
      <el-input v-model="newFormInline.code" placeholder="如 SKU00041" :disabled="!!newFormInline.id" />
    </el-form-item>
    <el-form-item label="物料名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="物料名称" />
    </el-form-item>
    <el-form-item label="分类" prop="category">
      <el-select v-model="newFormInline.category" style="width: 100%">
        <el-option v-for="d in materialCategoryOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="规格">
      <el-input v-model="newFormInline.spec" placeholder="规格型号" />
    </el-form-item>
    <el-form-item label="单位">
      <el-select v-model="newFormInline.unit" style="width: 100%">
        <el-option v-for="u in unitOptions" :key="u" :label="u" :value="u" />
      </el-select>
    </el-form-item>
    <el-form-item label="条码">
      <el-input v-model="newFormInline.barcode" placeholder="商品条码（一物多码可维护多条）" />
    </el-form-item>
    <el-form-item label="货主">
      <el-select v-model="newFormInline.ownerName" style="width: 100%">
        <el-option v-for="o in ownerOptions" :key="o.value" :label="o.label" :value="o.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="效期管理">
      <el-radio-group v-model="newFormInline.isExpiry">
        <el-radio :value="1">是</el-radio>
        <el-radio :value="0">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="序列号管理">
      <el-radio-group v-model="newFormInline.isSerial">
        <el-radio :value="1">是</el-radio>
        <el-radio :value="0">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="安全库存">
      <el-input-number v-model="newFormInline.safetyQty" :min="0" style="width: 100%" />
    </el-form-item>
    <el-form-item label="单价(元)">
      <el-input-number v-model="newFormInline.price" :min="0" :precision="2" style="width: 100%" />
    </el-form-item>
    <el-form-item label="状态">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="0">停用</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

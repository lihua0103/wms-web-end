<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { WarehouseItem } from "@/api/master";

interface Props {
  formInline: Partial<WarehouseItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [{ required: true, message: "请输入仓库编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入仓库名称", trigger: "blur" }]
};

const typeOptions = [
  { value: "normal", label: "普通" },
  { value: "cold", label: "冷链" },
  { value: "dangerous", label: "危化" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="仓库编码" prop="code">
      <el-input v-model="newFormInline.code" placeholder="如 WH004" :disabled="!!newFormInline.id" />
    </el-form-item>
    <el-form-item label="仓库名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="仓库名称" />
    </el-form-item>
    <el-form-item label="仓库类型" prop="type">
      <el-select v-model="newFormInline.type" style="width: 100%">
        <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="地址">
      <el-input v-model="newFormInline.address" placeholder="详细地址" />
    </el-form-item>
    <el-form-item label="联系人">
      <el-input v-model="newFormInline.contact" placeholder="联系人" />
    </el-form-item>
    <el-form-item label="电话">
      <el-input v-model="newFormInline.phone" placeholder="电话" />
    </el-form-item>
    <el-form-item label="总面积(㎡)">
      <el-input-number v-model="newFormInline.area" :min="0" style="width: 100%" />
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

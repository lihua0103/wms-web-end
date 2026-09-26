<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { OwnerItem } from "@/api/master";

interface Props {
  formInline: Partial<OwnerItem>;
}

const props = defineProps<Props>();

const formRef = ref();
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [{ required: true, message: "请输入货主编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入货主名称", trigger: "blur" }]
};
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="货主编码" prop="code">
      <el-input v-model="newFormInline.code" placeholder="如 OW001" :disabled="!!newFormInline.id" />
    </el-form-item>
    <el-form-item label="货主名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="货主名称" />
    </el-form-item>
    <el-form-item label="联系人">
      <el-input v-model="newFormInline.contact" placeholder="联系人" />
    </el-form-item>
    <el-form-item label="电话">
      <el-input v-model="newFormInline.phone" placeholder="电话" />
    </el-form-item>
    <el-form-item label="地址">
      <el-input v-model="newFormInline.address" placeholder="地址" />
    </el-form-item>
    <el-form-item label="结算方式">
      <el-select v-model="newFormInline.settleType" style="width: 100%">
        <el-option label="月结" value="月结" />
        <el-option label="现结" value="现结" />
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

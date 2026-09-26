<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { UserItem } from "@/api/system";

interface Props {
  formInline: Partial<UserItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  username: [{ required: true, message: "请输入用户账号", trigger: "blur" }],
  nickname: [{ required: true, message: "请输入用户昵称", trigger: "blur" }]
};

const roleOptions = [
  { value: "admin", label: "超级管理员" },
  { value: "warehouse_op", label: "仓库操作员" },
  { value: "inventory_mgr", label: "库存管理员" },
  { value: "transport_mgr", label: "运输调度员" }
];

const warehouseOptions = [
  { value: "WH001", label: "WH001 上海主仓" },
  { value: "WH002", label: "WH002 广州华南仓" },
  { value: "WH003", label: "WH003 成都西南仓" }
];
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="rules" label-width="100px">
    <el-form-item label="用户账号" prop="username">
      <el-input v-model="newFormInline.username" placeholder="请输入用户账号" :disabled="!!newFormInline.id" />
    </el-form-item>
    <el-form-item label="用户昵称" prop="nickname">
      <el-input v-model="newFormInline.nickname" placeholder="请输入用户昵称" />
    </el-form-item>
    <el-form-item label="手机号">
      <el-input v-model="newFormInline.phone" placeholder="请输入手机号" />
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model="newFormInline.email" placeholder="请输入邮箱" />
    </el-form-item>
    <el-form-item label="部门">
      <el-input v-model="newFormInline.dept" placeholder="请输入部门" />
    </el-form-item>
    <el-form-item label="所属仓库">
      <el-select v-model="newFormInline.warehouseCodes" multiple placeholder="请选择（可多选）" style="width: 100%">
        <el-option v-for="w in warehouseOptions" :key="w.value" :label="w.label" :value="w.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="角色">
      <el-select v-model="newFormInline.roles" multiple placeholder="请选择角色" style="width: 100%">
        <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
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

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { MenuItem } from "@/api/system";
import { menuTypeOptions } from "./utils/hook";

interface Props {
  formInline: Partial<MenuItem>;
  /** 上级菜单下拉选项（由 hook 拍平后传入） */
  parentOptions: { id: number; label: string }[];
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);
const parentOptions = props.parentOptions;

const rules: FormRules = {
  menuType: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  path: [{ required: true, message: "请输入路由地址", trigger: "blur" }]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="上级菜单" prop="parentId">
      <el-select
        v-model="newFormInline.parentId"
        placeholder="顶级菜单"
        clearable
        filterable
        style="width: 100%"
      >
        <el-option
          v-for="p in parentOptions"
          :key="p.id"
          :label="p.label"
          :value="p.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="菜单类型" prop="menuType">
      <el-radio-group v-model="newFormInline.menuType">
        <el-radio v-for="t in menuTypeOptions" :key="t.value" :value="t.value">
          {{ t.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="菜单名称" prop="name">
      <el-input v-model="newFormInline.name" placeholder="请输入菜单名称" />
    </el-form-item>
    <el-form-item
      v-if="newFormInline.menuType !== 'button'"
      label="路由地址"
      prop="path"
    >
      <el-input
        v-model="newFormInline.path"
        placeholder="请输入路由地址，如 /system/user"
      />
    </el-form-item>
    <el-form-item
      v-if="newFormInline.menuType === 'menu'"
      label="组件路径"
      prop="component"
    >
      <el-input
        v-model="newFormInline.component"
        placeholder="请输入组件路径，如 system/user/index"
      />
    </el-form-item>
    <el-form-item
      v-if="newFormInline.menuType === 'button'"
      label="权限标识"
      prop="permission"
    >
      <el-input
        v-model="newFormInline.permission"
        placeholder="请输入权限标识，如 system:user:add"
      />
    </el-form-item>
    <el-form-item label="图标" prop="icon">
      <el-input
        v-model="newFormInline.icon"
        placeholder="请输入图标标识，如 ep/setting"
      />
    </el-form-item>
    <el-form-item label="排序" prop="sort">
      <el-input-number
        v-model="newFormInline.sort"
        :min="0"
        controls-position="right"
      />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">启用</el-radio>
        <el-radio :value="0">停用</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

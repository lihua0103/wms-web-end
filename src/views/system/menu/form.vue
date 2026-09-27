<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { MenuItem } from "@/api/system";
import { $t } from "@/plugins/i18n";
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
  menuType: [
    {
      required: true,
      message: $t("system.menu.typeMsg"),
      trigger: "change"
    }
  ],
  name: [
    { required: true, message: $t("system.menu.namePh"), trigger: "blur" }
  ],
  path: [
    { required: true, message: $t("system.menu.pathMsg"), trigger: "blur" }
  ]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('system.menu.parent')" prop="parentId">
      <el-select
        v-model="newFormInline.parentId"
        :placeholder="$t('system.menu.parentPh')"
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
    <el-form-item :label="$t('system.menu.type')" prop="menuType">
      <el-radio-group v-model="newFormInline.menuType">
        <el-radio v-for="t in menuTypeOptions" :key="t.value" :value="t.value">
          {{ t.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('system.menu.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('system.menu.namePh')"
      />
    </el-form-item>
    <el-form-item
      v-if="newFormInline.menuType !== 'button'"
      :label="$t('system.menu.path')"
      prop="path"
    >
      <el-input
        v-model="newFormInline.path"
        :placeholder="$t('system.menu.pathPh')"
      />
    </el-form-item>
    <el-form-item
      v-if="newFormInline.menuType === 'menu'"
      :label="$t('system.menu.component')"
      prop="component"
    >
      <el-input
        v-model="newFormInline.component"
        :placeholder="$t('system.menu.componentPh')"
      />
    </el-form-item>
    <el-form-item
      v-if="newFormInline.menuType === 'button'"
      :label="$t('system.menu.permission')"
      prop="permission"
    >
      <el-input
        v-model="newFormInline.permission"
        :placeholder="$t('system.menu.permissionPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.menu.icon')" prop="icon">
      <el-input
        v-model="newFormInline.icon"
        :placeholder="$t('system.menu.iconPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.menu.sort')" prop="sort">
      <el-input-number
        v-model="newFormInline.sort"
        :min="0"
        controls-position="right"
      />
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("common.buttons.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("common.buttons.disabled") }}</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

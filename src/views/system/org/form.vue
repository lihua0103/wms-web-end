<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { OrgItem } from "@/api/system";
import { $t } from "@/plugins/i18n";
import { orgTypeOptions } from "./utils/hook";

interface Props {
  formInline: Partial<OrgItem>;
  /** 上级组织下拉选项（由 hook 拍平后传入） */
  parentOptions: { id: number; label: string }[];
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);
const parentOptions = props.parentOptions;

const rules: FormRules = {
  type: [
    {
      required: true,
      message: $t("system.org.typePh"),
      trigger: "change"
    }
  ],
  name: [{ required: true, message: $t("system.org.namePh"), trigger: "blur" }]
};
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('system.org.parent')" prop="parentId">
      <el-select
        v-model="newFormInline.parentId"
        :placeholder="$t('system.org.parentPh')"
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
    <el-form-item :label="$t('system.org.type')" prop="type">
      <el-select
        v-model="newFormInline.type"
        :placeholder="$t('system.org.typePh')"
        style="width: 100%"
      >
        <el-option
          v-for="t in orgTypeOptions"
          :key="t.value"
          :label="t.label"
          :value="t.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('system.org.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('system.org.namePh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.org.leader')" prop="leader">
      <el-input
        v-model="newFormInline.leader"
        :placeholder="$t('system.org.leaderPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.org.phone')" prop="phone">
      <el-input
        v-model="newFormInline.phone"
        :placeholder="$t('system.org.phonePh')"
      />
    </el-form-item>
  </el-form>
</template>

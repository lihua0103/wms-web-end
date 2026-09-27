<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { NoticeItem } from "@/api/system";
import { $t } from "@/plugins/i18n";
import { noticeTypeOptions, noticeLevelOptions } from "./utils/hook";

interface Props {
  formInline: Partial<NoticeItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  title: [
    { required: true, message: $t("system.notice.keywordPh"), trigger: "blur" }
  ],
  type: [
    {
      required: true,
      message: $t("system.notice.typeMsg"),
      trigger: "change"
    }
  ],
  level: [
    { required: true, message: $t("system.notice.levelPh"), trigger: "change" }
  ],
  content: [
    {
      required: true,
      message: $t("system.notice.contentPh"),
      trigger: "blur"
    }
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
    <el-form-item :label="$t('system.notice.fullTitle')" prop="title">
      <el-input
        v-model="newFormInline.title"
        :placeholder="$t('system.notice.keywordPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.notice.type')" prop="type">
      <el-radio-group v-model="newFormInline.type">
        <el-radio
          v-for="t in noticeTypeOptions"
          :key="t.value"
          :value="t.value"
        >
          {{ t.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('system.notice.level')" prop="level">
      <el-radio-group v-model="newFormInline.level">
        <el-radio
          v-for="l in noticeLevelOptions"
          :key="l.value"
          :value="l.value"
        >
          {{ l.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('system.notice.contentTitle')" prop="content">
      <el-input
        v-model="newFormInline.content"
        type="textarea"
        :rows="5"
        :placeholder="$t('system.notice.contentPh')"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import type { UserItem } from "@/api/system";
import { $t } from "@/plugins/i18n";

interface Props {
  formInline: Partial<UserItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  username: [
    { required: true, message: $t("system.user.accountPh"), trigger: "blur" }
  ],
  nickname: [
    { required: true, message: $t("system.user.nicknamePh"), trigger: "blur" }
  ]
};

const roleOptions = [
  { value: "admin", label: $t("system.user.roleSuperAdmin") },
  { value: "warehouse_op", label: $t("system.user.roleWarehouseOp") },
  { value: "inventory_mgr", label: $t("system.user.roleInventoryMgr") },
  { value: "transport_mgr", label: $t("system.user.roleTransportMgr") }
];

const warehouseOptions = [
  { value: "WH001", label: $t("system.user.wh001") },
  { value: "WH002", label: $t("system.user.wh002") },
  { value: "WH003", label: $t("system.user.wh003") }
];
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('system.user.userAccount')" prop="username">
      <el-input
        v-model="newFormInline.username"
        :placeholder="$t('system.user.accountPh')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('system.user.userNickname')" prop="nickname">
      <el-input
        v-model="newFormInline.nickname"
        :placeholder="$t('system.user.nicknamePh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.user.phone')">
      <el-input
        v-model="newFormInline.phone"
        :placeholder="$t('system.user.phonePh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.user.email')">
      <el-input
        v-model="newFormInline.email"
        :placeholder="$t('system.user.emailPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.user.dept')">
      <el-input
        v-model="newFormInline.dept"
        :placeholder="$t('system.user.deptPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('system.user.warehouse')">
      <el-select
        v-model="newFormInline.warehouseCodes"
        multiple
        :placeholder="$t('system.user.warehousePh')"
        style="width: 100%"
      >
        <el-option
          v-for="w in warehouseOptions"
          :key="w.value"
          :label="w.label"
          :value="w.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('system.user.role')">
      <el-select
        v-model="newFormInline.roles"
        multiple
        :placeholder="$t('system.user.rolePh')"
        style="width: 100%"
      >
        <el-option
          v-for="r in roleOptions"
          :key="r.value"
          :label="r.label"
          :value="r.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')">
      <el-radio-group v-model="newFormInline.status">
        <el-radio :value="1">{{ $t("common.buttons.enabled") }}</el-radio>
        <el-radio :value="0">{{ $t("common.buttons.disabled") }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('common.columns.remark')">
      <el-input
        v-model="newFormInline.remark"
        type="textarea"
        :placeholder="$t('common.columns.remark')"
      />
    </el-form-item>
  </el-form>
</template>

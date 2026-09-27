<script setup lang="ts">
import { reactive, ref } from "vue";
import type { FormRules } from "element-plus";
import { $t } from "@/plugins/i18n";
import type { AiWorkflowItem, AiWorkflowStep } from "@/api/ai";
import {
  aiSceneOptions,
  aiTriggerOptions,
  aiModelOptions,
  aiNodeTypeOptions
} from "@/constants/wms";

interface Props {
  formInline: Partial<AiWorkflowItem>;
}

const props = defineProps<Props>();

const formRef = ref();
// 注意：此处不能直接解构 props，需保持对同一对象的引用以便 hook 中 beforeSure 读取最新值
const newFormInline = reactive(props.formInline);

const rules: FormRules = {
  code: [
    { required: true, message: $t("ai.workflow.codeRequired"), trigger: "blur" }
  ],
  name: [
    { required: true, message: $t("ai.workflow.nameRequired"), trigger: "blur" }
  ],
  scene: [
    {
      required: true,
      message: $t("ai.workflow.sceneRequired"),
      trigger: "change"
    }
  ],
  triggerType: [
    {
      required: true,
      message: $t("ai.workflow.triggerRequired"),
      trigger: "change"
    }
  ],
  model: [
    {
      required: true,
      message: $t("ai.workflow.modelRequired"),
      trigger: "change"
    }
  ]
};

/** 步骤编排：增删与上移下移（保持对 newFormInline.steps 的引用） */
function addStep() {
  newFormInline.steps = [
    ...(newFormInline.steps ?? []),
    { name: "", type: "llm" }
  ];
}

function removeStep(idx: number) {
  newFormInline.steps = (newFormInline.steps ?? []).filter((_, i) => i !== idx);
}

function moveStep(idx: number, dir: -1 | 1) {
  const steps = newFormInline.steps ?? [];
  const target = idx + dir;
  if (target < 0 || target >= steps.length) return;
  const tmp = steps[idx];
  steps[idx] = steps[target];
  steps[target] = tmp;
}
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="$t('ai.workflow.code')" prop="code">
      <el-input
        v-model="newFormInline.code"
        :placeholder="$t('ai.workflow.codePh')"
        :disabled="!!newFormInline.id"
      />
    </el-form-item>
    <el-form-item :label="$t('ai.workflow.name')" prop="name">
      <el-input
        v-model="newFormInline.name"
        :placeholder="$t('ai.workflow.nameFormPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('ai.workflow.scene')" prop="scene">
      <el-select v-model="newFormInline.scene" style="width: 100%">
        <el-option
          v-for="d in aiSceneOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('ai.workflow.triggerType')" prop="triggerType">
      <el-radio-group v-model="newFormInline.triggerType">
        <el-radio
          v-for="d in aiTriggerOptions"
          :key="d.value"
          :value="d.value"
          >{{ d.label }}</el-radio
        >
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-if="newFormInline.triggerType === 'scheduled'"
      :label="$t('ai.workflow.cronExpr')"
      prop="cronExpr"
    >
      <el-input
        v-model="newFormInline.cronExpr"
        :placeholder="$t('ai.workflow.cronPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('ai.workflow.model')" prop="model">
      <el-select v-model="newFormInline.model" style="width: 100%">
        <el-option
          v-for="d in aiModelOptions"
          :key="d.value"
          :label="d.label"
          :value="d.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('common.columns.status')" prop="status">
      <el-radio-group v-model="newFormInline.status">
        <el-radio value="enabled">{{ $t("common.buttons.enabled") }}</el-radio>
        <el-radio value="disabled">{{
          $t("common.buttons.disabled")
        }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item :label="$t('ai.workflow.description')" prop="description">
      <el-input
        v-model="newFormInline.description"
        type="textarea"
        :rows="2"
        :placeholder="$t('ai.workflow.descPh')"
      />
    </el-form-item>
    <el-form-item :label="$t('ai.workflow.steps')">
      <div class="steps-editor">
        <div
          v-for="(s, idx) in newFormInline.steps"
          :key="idx"
          class="step-row"
        >
          <span class="idx">{{ idx + 1 }}</span>
          <el-input
            v-model="s.name"
            :placeholder="$t('ai.workflow.stepNamePh')"
            style="flex: 1"
          />
          <el-select v-model="s.type" style="width: 120px">
            <el-option
              v-for="d in aiNodeTypeOptions"
              :key="d.value"
              :label="d.label"
              :value="d.value"
            />
          </el-select>
          <el-button
            link
            type="primary"
            :disabled="idx === 0"
            @click="moveStep(idx, -1)"
          >
            {{ $t("ai.workflow.moveUp") }}
          </el-button>
          <el-button
            link
            type="primary"
            :disabled="idx === (newFormInline.steps?.length ?? 0) - 1"
            @click="moveStep(idx, 1)"
          >
            {{ $t("ai.workflow.moveDown") }}
          </el-button>
          <el-button link type="danger" @click="removeStep(idx)">
            {{ $t("common.buttons.delete") }}
          </el-button>
        </div>
        <el-button style="width: 100%; border-style: dashed" @click="addStep">
          {{ $t("ai.workflow.addStep") }}
        </el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.steps-editor {
  width: 100%;

  .step-row {
    display: flex;
    gap: 6px;
    align-items: center;
    width: 100%;
    margin-bottom: 8px;

    .idx {
      width: 18px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
    }
  }
}
</style>

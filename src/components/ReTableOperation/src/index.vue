<script setup lang="ts">
import { computed, type Component } from "vue";
import { $t } from "@/plugins/i18n";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import ArrowDown from "~icons/ep/arrow-down";
import type { TableOperationButton } from "./type";

interface Props {
  buttons: TableOperationButton[];
  /** 直接展示的按钮数量,超出部分收进"更多"下拉 */
  max?: number;
  /** 无可用按钮时的占位文案(如 "-") */
  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), { max: 2 });

const visibleButtons = computed(() => props.buttons.slice(0, props.max));
const dropdownButtons = computed(() => props.buttons.slice(props.max));

function renderIcon(icon?: Component) {
  return icon ? useRenderIcon(icon) : undefined;
}
</script>

<template>
  <div v-if="buttons.length" class="re-table-operation">
    <el-button
      v-for="btn in visibleButtons"
      :key="btn.label"
      link
      :type="btn.type ?? 'primary'"
      :disabled="btn.disabled"
      :icon="renderIcon(btn.icon)"
      @click.stop="btn.onClick?.()"
    >
      {{ btn.label }}
    </el-button>
    <el-dropdown
      v-if="dropdownButtons.length"
      trigger="hover"
      popper-class="re-table-operation__dropdown"
      @command="(index: number) => dropdownButtons[index]?.onClick?.()"
    >
      <el-button link type="primary" @click.stop>
        {{ $t("common.buttons.more") }}
        <el-icon class="re-table-operation__arrow"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(btn, index) in dropdownButtons"
            :key="btn.label"
            :command="index"
            :disabled="btn.disabled"
            :class="{ 'is-danger': btn.type === 'danger' }"
          >
            <el-icon v-if="btn.icon">
              <component :is="renderIcon(btn.icon)" />
            </el-icon>
            {{ btn.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <span v-else-if="emptyText" class="re-table-operation__empty">
    {{ emptyText }}
  </span>
</template>

<style scoped lang="scss">
.re-table-operation {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;

  .el-button + .el-button {
    margin-left: 8px;
  }

  &__arrow {
    margin-left: 2px;
  }
}
</style>

<style lang="scss">
.re-table-operation__dropdown {
  .el-dropdown-menu__item.is-danger {
    color: var(--el-color-danger);

    &:not(.is-disabled):hover,
    &:not(.is-disabled):focus {
      background-color: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
  }
}

.re-table-operation__empty {
  color: var(--el-text-color-placeholder);
}
</style>

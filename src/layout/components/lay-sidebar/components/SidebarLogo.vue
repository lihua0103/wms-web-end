<script setup lang="ts">
import { getTopMenu } from "@/router/utils";
import { useNav } from "@/layout/hooks/useNav";

defineProps({
  collapse: Boolean
});

const { title, getLogo } = useNav();
</script>

<template>
  <div class="sidebar-logo-container" :class="{ collapses: collapse }">
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img :src="getLogo()" alt="logo" />
        <span class="sidebar-title">{{ title }}</span>
      </router-link>
      <router-link
        v-else
        key="expand"
        :title="title"
        class="sidebar-logo-link"
        :to="getTopMenu()?.path ?? '/'"
      >
        <img :src="getLogo()" alt="logo" />
        <span class="sidebar-title">{{ title }}</span>
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 58px;
  overflow: hidden;

  .sidebar-logo-link {
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    align-items: center;
    height: 100%;
    padding: 0 14px;

    img {
      display: inline-block;
      flex-shrink: 0;
      width: 30px;
      height: 30px;
      border-radius: 7px;
    }

    .sidebar-title {
      display: block;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 15px;
      font-weight: 650;
      line-height: 20px;
      color: var(--pure-theme-sub-menu-active-text, #fff);
      letter-spacing: 0.2px;
      white-space: nowrap;
    }
  }

  &.collapses {
    .sidebar-logo-link {
      justify-content: center;
      padding: 0;
    }

    .sidebar-title {
      display: none;
    }
  }
}
</style>

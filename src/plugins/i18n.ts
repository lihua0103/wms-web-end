import type { App } from "vue";
import { createI18n } from "vue-i18n";
import messages from "@intlify/unplugin-vue-i18n/messages";

export type LocaleKey = "zh-CN" | "en";

/** 语言切换器可选项（label 为该语言的自称，不做翻译） */
export const localeOptions: { label: string; value: LocaleKey }[] = [
  { label: "简体中文", value: "zh-CN" },
  { label: "English", value: "en" }
];

const LOCALE_STORAGE_KEY = "wms-locale";

function getInitialLocale(): LocaleKey {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  return saved === "en" ? "en" : "zh-CN";
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: "zh-CN",
  globalInjection: true,
  messages
});

/** 注册 i18n（main.ts 中 app.use） */
export function useI18n(app: App) {
  app.use(i18n);
}

/** 全局翻译函数：模板外（hook.tsx、字典、api 等非组件上下文）使用，与模板内 $t 等价 */
export const $t = i18n.global.t;

/** 路由标题等场景：key 存在则翻译，否则原样返回（兼容后端下发的明文标题） */
export function transformI18n(title?: string): string {
  if (!title) return "";
  return i18n.global.te(title) ? i18n.global.t(title) : title;
}

/** 当前语言（响应式） */
export const currentLocale = i18n.global.locale;

/**
 * 切换语言：持久化后整页刷新。
 * 表格列头、字典等在模块加载时求值的文案依赖 reload 重建，与 pure-admin 行为一致。
 */
export function changeLocale(locale: LocaleKey) {
  if (locale === i18n.global.locale.value) return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  window.location.reload();
}

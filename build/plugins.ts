import { cdn } from "./cdn";
import vue from "@vitejs/plugin-vue";
import { viteBuildInfo } from "./info";
import svgLoader from "vite-svg-loader";
import Icons from "unplugin-icons/vite";
import type { PluginOption } from "vite";
import { loadEnv } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import tailwindcss from "@tailwindcss/vite";
import { configCompressPlugin } from "./compress";
import removeNoMatch from "vite-plugin-router-warn";
import { visualizer } from "rollup-plugin-visualizer";
import removeConsole from "vite-plugin-remove-console";
// code-inspector 已禁用（见下方注释），保留此行以备恢复
// import { codeInspectorPlugin } from "code-inspector-plugin";
import { vitePluginFakeServer } from "vite-plugin-fake-server";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import { root, pathResolve } from "./utils";

export function getPluginsList(
  VITE_CDN: boolean,
  VITE_COMPRESSION: ViteCompression,
  mode: string
): PluginOption[] {
  const lifecycle = process.env.npm_lifecycle_event;
  // VITE_USE_MOCK=false 时关闭 mock 拦截，请求直连后端（配合 vite server.proxy 使用）
  const useMock = loadEnv(mode, root).VITE_USE_MOCK !== "false";
  return [
    tailwindcss(),
    vue(),
    // jsx、tsx语法支持
    vueJsx(),
    /**
     * 在页面上按住组合键时，鼠标在页面移动即会在 DOM 上出现遮罩层并显示相关信息，点击一下将自动打开 IDE 并将光标定位到元素对应的代码位置
     * Mac 默认组合键 Option + Shift
     * Windows 默认组合键 Alt + Shift
     * 更多用法看 https://inspector.fe-dev.cn/guide/start.html
     * 已禁用：@code-inspector/core 内部定时任务会因空响应 JSON 解析崩溃，导致 dev server 整个退出
     */
    // codeInspectorPlugin({
    //   bundler: "vite",
    //   hideConsole: true
    // }),
    viteBuildInfo(),
    /**
     * 开发环境下移除非必要的vue-router动态路由警告No match found for location with path
     * 非必要具体看 https://github.com/vuejs/router/issues/521 和 https://github.com/vuejs/router/issues/359
     * vite-plugin-router-warn只在开发环境下启用，只处理vue-router文件并且只在服务启动或重启时运行一次，性能消耗可忽略不计
     */
    removeNoMatch(),
    // mock支持（通过 .env 的 VITE_USE_MOCK 控制开关）
    useMock
      ? vitePluginFakeServer({
          logger: false,
          include: "mock",
          infixName: false,
          enableProd: true
        })
      : null,
    // i18n：语言包（src/locales/*.yaml）预编译，@intlify/unplugin-vue-i18n/locales 虚拟模块读取
    VueI18nPlugin({
      include: [pathResolve("../src/locales/**", import.meta.url)]
    }),
    // svg组件化支持
    svgLoader(),
    // 自动按需加载图标
    Icons({
      compiler: "vue3",
      scale: 1
    }),
    VITE_CDN ? cdn : null,
    configCompressPlugin(VITE_COMPRESSION),
    // 线上环境删除console
    removeConsole({ external: ["src/assets/iconfont/iconfont.js"] }),
    // 打包分析
    lifecycle === "report"
      ? visualizer({ open: true, brotliSize: true, filename: "report.html" })
      : (null as any)
  ];
}

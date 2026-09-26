// 动态路由：本项目菜单/路由全部由前端本地静态路由（src/router/modules/*.ts）提供
// 后端如需下发菜单，可在此返回路由数组；当前返回空数组即可
import { defineFakeRoute } from "vite-plugin-fake-server/client";

export default defineFakeRoute([
  {
    url: "/get-async-routes",
    method: "get",
    response: () => {
      return {
        success: true,
        data: []
      };
    }
  }
]);

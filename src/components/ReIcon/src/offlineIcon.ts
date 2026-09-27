// 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
import { getSvgInfo } from "@pureadmin/utils";
import { addIcon } from "@iconify/vue/dist/offline";

// https://icon-sets.iconify.design/ep/?keyword=ep
import EpHomeFilled from "~icons/ep/home-filled?raw";

// https://icon-sets.iconify.design/ri/?keyword=ri
import RiSearchLine from "~icons/ri/search-line?raw";
import RiInformationLine from "~icons/ri/information-line?raw";

// WMS 菜单图标
import EpSetting from "~icons/ep/setting?raw";
import EpOfficeBuilding from "~icons/ep/office-building?raw";
import EpDownload from "~icons/ep/download?raw";
import EpUpload from "~icons/ep/upload?raw";
import EpBox from "~icons/ep/box?raw";
import EpOperation from "~icons/ep/operation?raw";
import EpVan from "~icons/ep/van?raw";
import EpCoin from "~icons/ep/coin?raw";
import EpDataAnalysis from "~icons/ep/data-analysis?raw";
import EpCpu from "~icons/ep/cpu?raw";
import EpMagicStick from "~icons/ep/magic-stick?raw";
import EpStamp from "~icons/ep/stamp?raw";

const icons = [
  // Element Plus Icon: https://github.com/element-plus/element-plus-icons
  ["ep/home-filled", EpHomeFilled],
  // Remix Icon: https://github.com/Remix-Design/RemixIcon
  ["ri/search-line", RiSearchLine],
  ["ri/information-line", RiInformationLine],
  // WMS 模块菜单
  ["ep/setting", EpSetting],
  ["ep/office-building", EpOfficeBuilding],
  ["ep/download", EpDownload],
  ["ep/upload", EpUpload],
  ["ep/box", EpBox],
  ["ep/operation", EpOperation],
  ["ep/van", EpVan],
  ["ep/coin", EpCoin],
  ["ep/data-analysis", EpDataAnalysis],
  ["ep/cpu", EpCpu],
  ["ep/magic-stick", EpMagicStick],
  ["ep/stamp", EpStamp]
];

// 本地菜单图标，后端在路由的 icon 中返回对应的图标字符串并且前端在此处使用 addIcon 添加即可渲染菜单图标
icons.forEach(([name, icon]) => {
  addIcon(name as string, getSvgInfo(icon as string));
});

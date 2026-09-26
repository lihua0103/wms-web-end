// 追加组件级设计皮肤到 wms-theme.scss
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const p = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "style",
  "wms-theme.scss"
);

const add = `
/* ---------- 8. 基础组件设计（按钮/输入框/表格/分页/描述列表） ---------- */
html:not(.dark) {
  /* 主按钮：品牌渐变 + 投影 */
  .el-button {
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .el-button--primary:not(.is-link):not(.is-text) {
    background: linear-gradient(135deg, #2563eb, #3b76f2);
    border: none;

    &:hover,
    &:focus {
      background: linear-gradient(135deg, #3b76f2, #5b84f0);
      box-shadow: 0 4px 14px -2px rgb(37 99 235 / 50%);
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 6px -2px rgb(37 99 235 / 45%);
    }

    &.is-disabled {
      background: #a8c0f5;
      box-shadow: none;
    }
  }

  /* 次按钮：描边淡入 */
  .el-button--default:not(.is-link):not(.is-text) {
    border-color: #d8dfea;
    color: #475569;

    &:hover,
    &:focus {
      color: #2563eb;
      border-color: #93b0f5;
      background: #f5f8ff;
    }
  }

  /* 输入框 / 选择器 */
  .el-input__wrapper,
  .el-select__wrapper,
  .el-textarea__inner {
    border-radius: 8px;
    box-shadow: 0 0 0 1px #dde4ef inset !important;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 0 0 1px #b6c6f3 inset !important;
    }
  }

  .el-input__wrapper.is-focus,
  .el-select__wrapper.is-focused {
    box-shadow: 0 0 0 1.5px #2563eb inset !important;
  }

  /* 表格：密度与细节 */
  .el-table {
    --el-table-row-hover-bg-color: #f4f8ff;

    td.el-table__cell {
      padding: 11px 0;
      color: #334155;
    }

    th.el-table__cell {
      height: 46px;
    }

    .el-table__empty-block {
      background: #fbfcfe;
    }

    /* 边框模式整体圆角裁切 */
    &.el-table--border {
      border-radius: 10px;
      overflow: hidden;

      &::before,
      &::after {
        display: none;
      }
    }
  }

  /* 分页 */
  .el-pagination {
    .el-pager li,
    button.btn-prev,
    button.btn-next {
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        color: #2563eb;
      }
    }

    .el-pager li.is-active {
      background: linear-gradient(135deg, #2563eb, #3b76f2);
      color: #fff;
      border-radius: 8px;
    }
  }

  /* 描述列表（详情抽屉） */
  .el-descriptions {
    --el-descriptions-item-bordered-label-background: #f6f8fc;

    .el-descriptions__label {
      font-weight: 600;
      color: #475569;
    }

    .el-descriptions__body {
      border-radius: 10px;
      overflow: hidden;
    }
  }

  /* 对话框按钮宽度统一 */
  .el-dialog__footer .el-button,
  .el-message-box__btns .el-button {
    min-width: 84px;
    border-radius: 8px;
  }

  /* 时间线 */
  .el-timeline-item__node {
    box-shadow: 0 0 0 3px rgb(37 99 235 / 15%);
  }

  /* 进度条圆角 */
  .el-progress-bar__outer,
  .el-progress-bar__inner {
    border-radius: 999px;
  }
}
`;

let s = readFileSync(p, "utf8");
if (!s.includes("基础组件设计")) {
  writeFileSync(p, s + add, "utf8");
  console.log("appended component skin");
} else {
  console.log("already exists");
}

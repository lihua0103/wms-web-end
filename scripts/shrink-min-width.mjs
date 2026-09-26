// 第二遍：minWidth 数值整体缩放 0.8（四舍五入到 10），避免窄容器下横向溢出
// 宽屏时 el-table 会将剩余宽度分配给 minWidth 列，表格依然铺满 100%
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const viewsRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "views"
);

let touched = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      walk(p);
    } else if (name === "hook.tsx") {
      const src = readFileSync(p, "utf8");
      let modified = false;
      const next = src
        .split("\n")
        .map(line => {
          if (/\bminWidth:\s*\d+/.test(line) && !/fixed:\s*["']/.test(line)) {
            const replaced = line.replace(/\bminWidth:\s*(\d+)/g, (_, n) => {
              const v = Math.max(60, Math.round((Number(n) * 0.8) / 10) * 10);
              return `minWidth: ${v}`;
            });
            if (replaced !== line) {
              modified = true;
              return replaced;
            }
          }
          return line;
        })
        .join("\n");
      if (modified) {
        writeFileSync(p, next, "utf8");
        touched++;
      }
    }
  }
}

walk(viewsRoot);
console.log(`shrunk minWidth in ${touched} files`);

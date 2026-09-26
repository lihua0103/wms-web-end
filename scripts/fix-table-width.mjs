// 表格列统一改造：非固定列 width -> minWidth，让表格自动铺满 100% 宽度
// 固定列（fixed: "right" 的操作列等）保持 width 不变
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
const changed = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      walk(p);
    } else if (name === "hook.tsx") {
      const src = readFileSync(p, "utf8");
      let modified = false;

      // 逐行处理：本行不含 fixed: 的 width: N 改为 minWidth: N
      const next = src
        .split("\n")
        .map(line => {
          if (/\bwidth:\s*\d+/.test(line) && !/fixed:\s*["']/.test(line)) {
            const replaced = line.replace(/\bwidth:\s*(\d+)/g, "minWidth: $1");
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
        changed.push(p);
      }
    }
  }
}

walk(viewsRoot);
console.log(`converted ${touched} hook files`);
for (const f of changed) console.log(" -", f);

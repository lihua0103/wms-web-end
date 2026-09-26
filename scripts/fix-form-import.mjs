// 修复 hook.tsx 中 import form 与搜索表单 const form 的命名冲突：
// import form from "../form.vue" -> import formComp from "../form.vue"
// content: form, -> content: formComp,
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const viewsRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "views"
);

let fixed = 0;
const changedFiles = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      walk(p);
    } else if (name === "hook.tsx") {
      let src = readFileSync(p, "utf8");
      if (src.includes('import form from "../form.vue";')) {
        const next = src
          .replace('import form from "../form.vue";', 'import formComp from "../form.vue";')
          .replace(/content: form,/g, "content: formComp,");
        if (next !== src) {
          writeFileSync(p, next, "utf8");
          fixed++;
          changedFiles.push(p);
        }
      }
    }
  }
}

walk(viewsRoot);
console.log(`fixed ${fixed} files`);
for (const f of changedFiles) console.log(" -", f);

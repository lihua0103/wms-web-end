// 校验：源码中所有静态 $t()/transformI18n key 是否存在于语言包（纯 node 扫描）
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";

const zh = YAML.parse(readFileSync("src/locales/zh-CN.yaml", "utf8"));
const en = YAML.parse(readFileSync("src/locales/en.yaml", "utf8"));

function flatten(obj, prefix = "", out = new Set()) {
  for (const [k, v] of Object.entries(obj || {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") flatten(v, p, out);
    else out.add(p);
  }
  return out;
}
const zhKeys = flatten(zh);
const enKeys = flatten(en);

const files = [];
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (f === "node_modules" || f === "dist" || f === "locales") continue;
      walk(p);
    } else if (/\.(vue|ts|tsx)$/.test(f)) {
      files.push(p);
    }
  }
}
walk("src");

const candidates = new Map(); // key -> [file]
const re = /\$t\(\s*["']([^"']+)["']|\$t\(\s*`([^`$]+)`|transformI18n\(\s*["']([^"']+)["']/g;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(re)) {
    const k = m[1] || m[2] || m[3];
    if (!k || k.includes("${")) continue;
    if (!candidates.has(k)) candidates.set(k, []);
    candidates.get(k).push(f);
  }
}

const missZh = [];
const missEn = [];
for (const [k, fs] of candidates) {
  if (!zhKeys.has(k)) missZh.push([k, fs[0]]);
  if (!enKeys.has(k)) missEn.push([k, fs[0]]);
}
console.log(`refs: ${candidates.size}, zh keys: ${zhKeys.size}, en keys: ${enKeys.size}`);
console.log(`missing in zh: ${missZh.length}`);
missZh.slice(0, 50).forEach(([k, f]) => console.log(`  ${k}  <- ${f}`));
console.log(`missing in en: ${missEn.length}`);
missEn.slice(0, 50).forEach(([k, f]) => console.log(`  ${k}  <- ${f}`));
process.exit(missZh.length || missEn.length ? 1 : 0);

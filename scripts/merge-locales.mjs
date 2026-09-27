// 合并 locales-staging/*.zh.yaml / *.en.yaml 到 src/locales/{zh-CN,en}.yaml
// 用法：node scripts/merge-locales.mjs [--check]
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";

const root = process.cwd();
const staging = join(root, "locales-staging");
const zhPath = join(root, "src/locales/zh-CN.yaml");
const enPath = join(root, "src/locales/en.yaml");
const checkOnly = process.argv.includes("--check");

function keyTree(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj || {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") keys.push(...keyTree(v, p));
    else keys.push(p);
  }
  return keys;
}

if (!existsSync(staging)) {
  console.log("no staging dir");
  process.exit(0);
}

const files = readdirSync(staging).filter(f => f.endsWith(".zh.yaml"));
const zhMain = YAML.parse(readFileSync(zhPath, "utf8"));
const enMain = YAML.parse(readFileSync(enPath, "utf8"));
const topUsed = new Set(Object.keys(zhMain));

let mergedZh = { ...zhMain };
let mergedEn = { ...enMain };
let totalKeys = 0;
const problems = [];

for (const f of files) {
  const mod = f.replace(/\.zh\.yaml$/, "");
  const zhFrag = YAML.parse(readFileSync(join(staging, f), "utf8"));
  const enFile = `${mod}.en.yaml`;
  if (!existsSync(join(staging, enFile))) {
    problems.push(`missing ${enFile}`);
    continue;
  }
  const enFrag = YAML.parse(readFileSync(join(staging, enFile), "utf8"));

  const zhTop = Object.keys(zhFrag || {});
  const enTop = Object.keys(enFrag || {});
  const dupTop = zhTop.filter(k => topUsed.has(k));
  if (dupTop.length) {
    problems.push(`${mod}: duplicate top-level key(s) ${dupTop.join(",")}`);
    continue;
  }
  if (zhTop.join() !== enTop.join()) {
    problems.push(`${mod}: top-level mismatch zh=[${zhTop}] en=[${enTop}]`);
    continue;
  }
  zhTop.forEach(k => topUsed.add(k));

  const zhKeys = new Set(zhTop.flatMap(t => keyTree(zhFrag[t])));
  const enKeys = new Set(enTop.flatMap(t => keyTree(enFrag[t])));
  const onlyZh = [...zhKeys].filter(k => !enKeys.has(k));
  const onlyEn = [...enKeys].filter(k => !zhKeys.has(k));
  if (onlyZh.length || onlyEn.length) {
    problems.push(
      `${mod}: key tree mismatch (zh-only: ${onlyZh.slice(0, 5).join(", ")}${onlyZh.length > 5 ? "..." : ""}; en-only: ${onlyEn.slice(0, 5).join(", ")}${onlyEn.length > 5 ? "..." : ""})`
    );
  }
  for (const k of zhKeys) {
    const v = k.split(".").reduce(
      (o, seg) => o?.[seg],
      zhTop.length === 1 ? zhFrag[zhTop[0]] : zhFrag
    );
    if (typeof v === "string" && !v.trim()) problems.push(`${mod}: empty zh value ${k}`);
  }

  for (const t of zhTop) {
    mergedZh[t] = zhFrag[t];
    mergedEn[t] = enFrag[t];
  }
  totalKeys += zhKeys.size;
  console.log(`${mod}: ${zhKeys.size} keys`);
}

if (problems.length) {
  console.log("\nPROBLEMS:");
  for (const p of problems) console.log("  " + p);
}

if (checkOnly) {
  console.log(`\n[check] ${files.length} modules, ${totalKeys} keys, ${problems.length} problems`);
  process.exit(problems.length ? 1 : 0);
}

if (problems.length) {
  console.log("\nAborting merge due to problems. Fix staging files first.");
  process.exit(1);
}

const opt = { lineWidth: 0 };
writeFileSync(zhPath, YAML.stringify(mergedZh, opt) + "\n", "utf8");
writeFileSync(enPath, YAML.stringify(mergedEn, opt) + "\n", "utf8");
console.log(`\nMerged ${files.length} modules / ${totalKeys} keys into main locales.`);

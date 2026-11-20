/* One-shot codemod: strip TypeScript syntax and rename .ts/.tsx -> .js/.jsx */
import ts from "typescript"
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, unlinkSync } from "fs"
import { join, extname } from "path"

const roots = ["app", "components", "hooks", "lib"]
const files = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full)
    else if (/\.tsx?$/.test(entry)) files.push(full)
  }
}
for (const r of roots) if (existsSync(r)) walk(r)
if (existsSync("next.config.ts")) files.push("next.config.ts")

let failed = 0
for (const file of files) {
  const source = readFileSync(file, "utf8")
  const isTsx = file.endsWith(".tsx")
  const out = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      isolatedModules: true,
      esModuleInterop: true,
      skipLibCheck: true,
    },
  })
  const errs = (out.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error)
  if (errs.length) {
    failed++
    console.log(`!! ${file}`)
    for (const e of errs.slice(0, 5)) console.log("   ", ts.flattenDiagnosticMessageText(e.messageText, " "))
  }
  const ext = isTsx ? ".jsx" : ".js"
  const target = file.replace(/\.tsx?$/, ext)
  writeFileSync(target, out.outputText)
  unlinkSync(file)
  console.log(`   ${file} -> ${target}`)
}
console.log(`\nconverted ${files.length} files, ${failed} with diagnostics`)

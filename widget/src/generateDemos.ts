import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demosDir = path.join(__dirname, "../demos");
const template = fs.readFileSync(path.join(demosDir, "demo.html.template"), "utf-8");
const indexTemplate = fs.readFileSync(path.join(demosDir, "index.html.template"), "utf-8");

function render(template: string, vars: { title: string; version: string; script: string }): string {
  return template
    .replaceAll("__title__", vars.title)
    .replace("__version__", vars.version)
    .replace("__script__", vars.script.trimEnd());
}

const version = process.env.npm_package_version!;
const outDir = path.join(__dirname, "../dist/demos");
fs.mkdirSync(outDir, { recursive: true });

const entries = fs.readdirSync(demosDir)
  .filter(name => fs.statSync(path.join(demosDir, name)).isDirectory())
  .sort();

const demoList: { name: string; description: string }[] = [];

for (const name of entries) {
  const scriptPath = path.join(demosDir, name, "script.js");
  if (!fs.existsSync(scriptPath)) continue;

  const script = fs.readFileSync(scriptPath, "utf-8");
  const html = render(template, { title: name, version, script });

  const demoOutDir = path.join(outDir, name);
  fs.mkdirSync(demoOutDir, { recursive: true });
  fs.writeFileSync(path.join(demoOutDir, "index.html"), html);
  console.log(`Generated: dist/demos/${name}/index.html`);

  const readmePath = path.join(demosDir, name, "README.md");
  const description = fs.existsSync(readmePath)
    ? fs.readFileSync(readmePath, "utf-8").split("\n")[0].replace(/^#+\s*/, "")
    : "";
  demoList.push({ name, description });
}

const demoListHtml = demoList.map(d => `        <li><a href="demos/${d.name}/index.html">${d.name}</a><small>${d.description}</small></li>`).join("\n");
const indexHtml = indexTemplate
  .replaceAll("__version__", version)
  .replace("__demoList__", demoListHtml);

fs.writeFileSync(path.join(__dirname, "../dist/index.html"), indexHtml);
console.log("Generated: dist/index.html");
console.log(`${demoList.length} demo(s) generated.`);

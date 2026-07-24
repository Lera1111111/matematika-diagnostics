import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const routes = ["7", "8", "9", "oge", "after9"];
const dist = resolve("dist");
const source = resolve(dist, "index.html");

for (const route of routes) {
  const targetDirectory = resolve(dist, route);
  await mkdir(targetDirectory, { recursive: true });
  await copyFile(source, resolve(targetDirectory, "index.html"));
}

await copyFile(source, resolve(dist, "404.html"));

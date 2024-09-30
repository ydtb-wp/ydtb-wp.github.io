import data from "../data/database.json";

import { z } from "zod";
import { parseArgs } from "zod-args";
import { writeFileSync } from "fs";
import type { PluginListType, PluginType } from "./data-types";

const plugins: PluginListType = data.plugins;

const { slug, update_version, reference, vendor } = parseArgs({
  slug: z.string(),
  update_version: z.string(),
  reference: z.string(),
  vendor: z.string().optional(),
});

// check if the plugin exists in the database
const plugin: PluginType = plugins[`${slug}` as keyof typeof plugins];

if (!plugin) {
  plugins[`${slug}`] = {
    slug: `${slug}`,
    vendor: `${vendor || "ydtb"}`,
    version: `${update_version}`,
    tags: [`${update_version}`],
    ref: `${reference}`,
  };
}

plugins[`${slug}`].version = update_version;
if (!plugins[`${slug}`].tags.includes(update_version)) {
  plugins[`${slug}`].tags.push(update_version);
}
plugins[`${slug}`].ref = reference;

const json = JSON.stringify({ plugins: plugins }, null, 2);

console.log("Process", process.cwd());
console.log("Dirname", __dirname);

writeFileSync("data/database.json", json);

console.log("Database updated successfully");

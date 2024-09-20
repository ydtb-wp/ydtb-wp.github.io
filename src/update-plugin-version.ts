import data from "../data/database.json";

import { z } from "zod";
import { parseArgs } from "zod-args";
import { writeFileSync } from "fs";

type PluginType = {
  name: string;
  version: string;
  previous_tags: string[];
};

type PluginListType = {
  [key: string]: PluginType;
};

const plugins: PluginListType = data.plugins;

const { vendor, slug, update_version } = parseArgs({
  vendor: z.string(),
  slug: z.string(),
  update_version: z.string(),
});

// check if the plugin exists in the database
const plugin: PluginType = plugins[`${vendor}/${slug}` as keyof typeof plugins];

if (!plugin) {
  plugins[`${vendor}/${slug}`] = {
    name: `${slug}`,
    version: `${update_version}`,
    previous_tags: [`${update_version}`],
  };
}

plugins[`${vendor}/${slug}`].version = update_version;
plugins[`${vendor}/${slug}`].previous_tags.push(update_version);

const json = JSON.stringify({ plugins: plugins }, null, 2);

console.log("Process", process.cwd());
console.log("Dirname", __dirname);

writeFileSync("data/database.json", json);

console.log("Database updated successfully");

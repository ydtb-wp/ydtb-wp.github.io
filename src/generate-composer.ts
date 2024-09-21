import data from "../data/database.json";

import type { PackageJson, Packages, PluginListType } from "./data-types";

import { writeFileSync } from "fs";

import { z } from "zod";
import { parseArgs } from "zod-args";

const { host, out } = parseArgs({
  host: z.string(),
  out: z.string(),
});

const plugins: PluginListType = data.plugins;

const packages: Packages = {};

for (const [package_id, plugin] of Object.entries(plugins)) {
  console.log("--- ---");
  console.log(`\tProcessing plugin ${plugin.slug} from package ${package_id}`);
  console.log(`\t\tProcessing version dev-master of plugin ${plugin.slug}`);
  packages[package_id] = {
    "dev-master": {
      name: package_id,
      version: "dev-master",
      dist: {
        type: "zip",
        url: `https://github.com/${host}/${plugin.slug}/archive/refs/heads/main.zip`,
      },
      source: {
        type: "git",
        url: `git@github.com:${host}/${plugin.slug}.git`,
        reference: plugin.ref,
      },
      type: "wordpress-plugin",
      description: `WordPress plugin ${plugin.slug} by ${plugin.vendor} - Master Branch`,
    },
  };

  // listing all versions of the plugin
  for (const tag of plugin.tags) {
    console.log(`\t\tProcessing version ${tag} of plugin ${plugin.slug}`);

    packages[package_id][tag] = {
      name: package_id,
      version: tag,
      dist: {
        type: "zip",
        url: `https://github.com/${host}/${plugin.slug}/archive/refs/tags/${tag}.zip`,
      },
      source: {
        type: "git",
        url: `git@github.com:${host}/${plugin.slug}.git`,
        reference: tag,
      },
      type: "wordpress-plugin",
      description: `WordPress plugin ${plugin.slug} by ${plugin.vendor} - ${tag}`,
    };
  }
}

const json: PackageJson = { packages };

// console.log(JSON.stringify(json, null, 2));

writeFileSync(out, JSON.stringify(json, null, 2));

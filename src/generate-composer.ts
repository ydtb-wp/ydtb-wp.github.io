import data from "../data/database.json";

import type { PackageJson, Packages } from "./composer-data-types";

import { writeFileSync } from "fs";

import { z } from "zod";
import { parseArgs } from "zod-args";
import type { ComposerListType, DatabaseJson } from "./database-data-types";

const { host, out } = parseArgs({
  host: z.string(),
  out: z.string(),
});

const { plugins, themes } = data as DatabaseJson;

const packages: Packages = {};

const processItems = (
  items: ComposerListType,
  type: "wordpress-plugin" | "wordpress-theme"
) => {
  for (const [package_id, item] of Object.entries(items)) {
    console.log("--- ---");
    console.log(`\tProcessing ${type} ${item.slug} from package ${package_id}`);
    console.log(`\t\tProcessing version dev-master of ${type} ${item.slug}`);
    packages[`${item.vendor}/${item.slug}`] = {
      "dev-master": {
        name: `${item.vendor}/${item.slug}`,
        version: "dev-master",
        dist: {
          type: "zip",
          url: `https://github.com/${host}/${item.slug}/archive/refs/heads/main.zip`,
        },
        source: {
          type: "git",
          url: `git@github.com:${host}/${item.slug}.git`,
          reference: item.ref,
        },
        type,
        description: `WordPress ${type} ${item.slug} by ${item.vendor} - Master Branch`,
      },
    };

    // listing all tags of the item
    for (const tag of item.tags) {
      console.log(`\t\tProcessing tag ${tag} of ${type} ${item.slug}`);

      packages[`${item.vendor}/${item.slug}`][tag] = {
        name: `${item.vendor}/${item.slug}`,
        version: tag,
        dist: {
          type: "zip",
          url: `https://github.com/${host}/${item.slug}/archive/refs/tags/${tag}.zip`,
        },
        source: {
          type: "git",
          url: `git@github.com:${host}/${item.slug}.git`,
          reference: tag,
        },
        type,
        description: `WordPress ${type} ${item.slug} by ${item.vendor} - ${tag}`,
      };
    }
  }
};

console.log(plugins);
processItems(plugins, "wordpress-plugin");

console.log(themes);
processItems(themes, "wordpress-theme");

const json: PackageJson = { packages };

// console.log(JSON.stringify(json, null, 2));

writeFileSync(out, JSON.stringify(json, null, 2));

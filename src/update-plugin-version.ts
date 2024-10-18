import data from "../data/database.json";

import { z } from "zod";
import { parseArgs } from "zod-args";
import { writeFileSync } from "fs";
import type {
  ComposerListType,
  DatabaseJson,
  PackageDataType,
} from "./database-data-types";

// const plugins: ComposerListType = data.plugins;
// const themes: ComposerListType = data.themes;

const { plugins, themes } = data as DatabaseJson;

const { slug, update_version, reference, vendor, type } = parseArgs({
  slug: z.string(),
  update_version: z.string(),
  reference: z.string(),
  vendor: z.string().optional(),
  type: z.enum(["theme", "plugin"]),
});

const updatePackage = (
  collection: ComposerListType,
  slug: string,
  update_version: string,
  reference: string,
  vendor?: string
) => {
  const pkg: PackageDataType = collection[slug as keyof typeof collection];

  if (!pkg) {
    collection[slug] = {
      slug: slug,
      vendor: vendor || slug,
      version: update_version,
      tags: [update_version],
      ref: reference,
    };
  } else {
    pkg.version = update_version;
    if (!pkg.tags.includes(update_version)) {
      pkg.tags.push(update_version);
    }
    pkg.ref = reference;
  }
};

if (type === "plugin") {
  updatePackage(plugins, slug, update_version, reference, vendor);
} else if (type === "theme") {
  updatePackage(themes, slug, update_version, reference, vendor);
}

const json = JSON.stringify({ plugins: plugins, themes: themes }, null, 2);

console.log("Process", process.cwd());
console.log("Dirname", __dirname);

writeFileSync("data/database.json", json);

console.log("Database updated successfully");

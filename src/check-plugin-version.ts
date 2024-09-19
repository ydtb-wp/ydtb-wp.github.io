/**
 *
 * The purpose of this script is to read the database.json and determine if we need to fetch the plugin updates from the client that is running the plugin.
 * we do this by reading the database.json and see if the current incoming plugin version is later than the one listed in the database.json
 *
 * this requires the following arguments
 * --vendor: the vendor of the plugin
 * --slug: the slug of the plugin
 * --version: the version of the plugin
 *
 * the script will return true or false if the plugin needs to be updated
 */

import data from "../data/database.json";

import { z } from "zod";
import { parseArgs } from "zod-args";
import { compareVersions } from "compare-versions";

const { vendor, slug, update_version } = parseArgs({
  vendor: z.string(),
  slug: z.string(),
  update_version: z.string(),
});

// check if the plugin exists in the database
const plugin = data.plugins[`${vendor}/${slug}` as keyof typeof data.plugins];

if (!plugin) {
  console.log("Plugin Not Found in Database");
  process.exit(1);
}

// check if the plugin version is greater than the one in the database
if (compareVersions(update_version, plugin.version) < 1) {
  console.log("No Update Required");
  process.exit(1);
}

console.log("Update Required");
process.exit(0);

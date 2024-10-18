/**
 *
 * The purpose of this script is to read the database.json and determine if we need to fetch the plugin updates from the client that is running the plugin.
 * we do this by reading the database.json and see if the current incoming plugin version is later than the one listed in the database.json
 *
 * this requires the following arguments
 * --slug: the slug of the plugin
 * --version: the version of the plugin
 *
 * the script will return true or false if the plugin needs to be updated
 */

import data from "../data/database.json";

import { z } from "zod";
import { parseArgs } from "zod-args";
import { compareVersions } from "compare-versions";
import type { DatabaseJson } from "./database-data-types";

const { slug, update_version, type } = parseArgs({
  slug: z.string(),
  update_version: z.string(),
  type: z.enum(["theme", "plugin"]),
  vendor: z.string(),
});

function checkForUpdate(
  type: "plugin" | "theme",
  slug: string,
  update_version: string,
  data: DatabaseJson
): number {
  const packageData = type === "plugin" ? data.plugins : data.themes;
  const item = packageData[slug as keyof typeof packageData];

  if (!item) {
    console.log(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Not Found in Database`
    );
    return 1;
  }

  if (compareVersions(update_version, item.version) > 0) {
    console.log("Update Required");
    return 0;
  }

  console.log("No Update Required");
  return 1;
}

const result = checkForUpdate(type, slug, update_version, data);
process.exit(result);

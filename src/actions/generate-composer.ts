import data from "@/packages.json" assert { type: "json" };
import { writeFileSync } from "fs";
import { z } from "zod";
import { parseArgs } from "zod-args";
import type { ComposerPackages } from "~/types/ComposerPackage";
import type { PackageListType } from "~/types/PackageData";

const { host, out } = parseArgs({
  host: z.string(),
  out: z.string(),
});

const packageList = data as PackageListType;

const processItems = (items: PackageListType) => {
  const packages: ComposerPackages = { packages: {} };
  for (const [package_id, item] of Object.entries(items)) {
    const type = item.type.split("-")[1];
    console.log("--- ---");
    console.log(`\tProcessing ${type} ${item.slug} from package ${package_id}`);
    // console.log(
    //   `\t\tProcessing version dev-master of ${type} ${item.slug}`
    // );
    packages.packages[`${item.vendor}/${item.slug}`] = {
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
        type: item.type,
        description: `WordPress ${type} ${item.slug} by ${item.vendor} - Master Branch`,
      },
    };

    // listing all tags of the item
    for (const tag of item.tags) {
      console.log(`\t\tProcessing tag ${tag} of ${type} ${item.slug}`);

      packages.packages[`${item.vendor}/${item.slug}`][tag] = {
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
        type: item.type,
        description: `WordPress ${type} ${item.slug} by ${item.vendor} - ${tag}`,
      };
    }
  }
  return packages;
};

const result = processItems(packageList);

writeFileSync(out, JSON.stringify(result, null, 2));

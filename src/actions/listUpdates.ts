import { fetchAllPackages } from "~/handlers/fetch_source";

import data from "@/packages.json" assert { type: "json" };
import type { PackageDataType, PackageListType } from "~/types/PackageData";
import type {
  ComposerPackage,
  ComposerPackages,
} from "~/types/ComposerPackage";

export const listUpdates = async () => {
  const repos: ComposerPackages = await fetchAllPackages();
  const packageList: PackageListType = data as PackageListType;
  const availableUpdates: Array<{ [key: string]: ComposerPackage[] }> = [];

  for (const key in packageList) {
    if (packageList.hasOwnProperty(key)) {
      const pkgNewtags = findNewTags(repos, packageList[key]);
      availableUpdates.push({ [key]: pkgNewtags });
    }
  }
  return availableUpdates;
};

const findNewTags = (repos: ComposerPackages, pkg: PackageDataType) => {
  const newTags: ComposerPackage[] = [];
  for (const key in repos.packages) {
    if (pkg.aliases.includes(key)) {
      for (const tag in repos.packages[key]) {
        if (!pkg.tags.includes(tag)) {
          newTags.push({ [tag]: repos.packages[key][tag] });
        }
      }
    }
  }
  newTags.reverse();
  return newTags;
};

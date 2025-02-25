import type { ComposerPackage } from "~/types/ComposerPackage";
import data from "@/packages.json" assert { type: "json" };
import type { PackageListType } from "~/types/PackageData";
import {
  cleanUpTempDir,
  cloneGithubRepo,
  createGithubRepo,
  initializeNewRepo,
  removeGitFromLocalFiles,
  repoExists,
  storeCurrentPackage,
} from "~/lib/github";
import { pathAlias } from "~/lib/pathAlias";
import { writeFileSync } from "fs";
import { retrieveSourceAuth } from "~/actions/addSource";

const packageList: PackageListType = data as PackageListType;

export async function updatePackages(name: string, tags: ComposerPackage[]) {
  if (tags.length == 0) {
    return;
  }

  if (!packageList.hasOwnProperty(name)) {
    throw new Error(
      `Package with name ${name} does not exist. Try adding it first.`
    );
  }

  const packageData = packageList[name];
  const slug = packageData.slug;

  console.log(`\n\n---=== Running Update for ${name}  ===---`);
  console.log("Determined Slug: ", slug);

  const exists = await repoExists(slug);
  console.log("The Repo exists:", exists);

  if (!exists) {
    const type = packageData.type.split("-")[1];
    const newRepo = await createGithubRepo(slug, type);
    console.log("Created new repo");

    // Update the package.json file
    packageData.git = newRepo.html_url;
    packageList[name] = packageData;

    const aliasedPath = pathAlias("@", "packages.json");
    writeFileSync(aliasedPath, JSON.stringify(packageList, null, 2));
  }

  const tempDir = pathAlias("^");
  const packageDest = pathAlias("^", "package");
  await cleanUpTempDir(tempDir);

  console.log("\n * * Clone Git Repo * *");
  await cloneGithubRepo(slug, packageDest);
  if (!exists) {
    await initializeNewRepo(
      slug,
      packageDest,
      packageData.type,
      packageData.vendor
    );
  }

  console.log("\n * * Remove Git from Local Files * *");
  await removeGitFromLocalFiles(tempDir, packageDest);

  for (const tag of tags) {
    const tagVer = Object.keys(tag)[0];
    console.log(`\n * * Capturing Tag ${tagVer}  * *`);
    const tagData = Object.values(tag)[0];

    const tagAuth = retrieveSourceAuth(tagData.name.split("/")[0]);
    await storeCurrentPackage(packageData, tagData, tagAuth, tempDir);
  }
}

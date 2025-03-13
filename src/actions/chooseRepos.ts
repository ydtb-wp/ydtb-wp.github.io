import { fetchAllPackages } from "~/handlers/fetch_source";
import data from "@/packages.json" assert { type: "json" };
import type { PackageDataType, PackageListType } from "~/types/PackageData";
import type {
  ComposerPackage,
  ComposerPackages,
} from "~/types/ComposerPackage";
import { input, select, Separator } from "@inquirer/prompts";
import { pathAlias } from "~/lib/pathAlias";
import { writeFileSync } from "fs";

const packageList = data as PackageListType;

export const chooseRepos = async (all: boolean = false): Promise<void> => {
  const repos = await fetchAllPackages();

  let notDone = true;
  while (notDone) {
    let packages = detectMissingPackages(repos);
    if (packages.length === 0) {
      console.log("All packages are already added.");
      notDone = false;
      continue;
    }

    if (all) {
      for (const pkg of packages) {
        const slug = pkg.split("/")[1];
        const vendor = pkg.split("/")[0];
        const details: PackageDataType = {
          slug,
          vendor,
          ref: "",
          version: "",
          tags: [],
          git: "",
          aliases: [`${vendor}/${slug}`],
          type: repos.packages[pkg][Object.keys(repos.packages[pkg])[0]].type as "wordpress-plugin" | "wordpress-theme",
        };
        packageList[`${vendor}/${slug}`] = details;
      }
      const aliasedPath = pathAlias("@", "packages.json");
      writeFileSync(aliasedPath, JSON.stringify(packageList, null, 2));
      console.log("All missing packages have been added.");
      notDone = false;
      continue;
    }

    const answer = await select({
      message: "Select a missing package to add",
      choices: [
        ...packages.map((pkg) => ({
          name: pkg,
          value: pkg,
          description: `Add ${pkg} to the package list`,
        })),
        new Separator(),
        {
          name: "Exit",
          value: "exit",
          description: "Done Adding Packages",
        },
      ],
    });

    if (answer === "exit") {
      console.log("Exited package selection");
      notDone = false;
      continue;
    }

    console.log(`\nYou selected: ${answer}\n`);
    const details = await askPackageDetails(answer, repos.packages[answer]);
    details.aliases = [
      ...new Set([
        ...(details.aliases || []),
        `${details.vendor}/${details.slug}`,
      ]),
    ];
    packageList[`${details.vendor}/${details.slug}`] = details;

    const aliasedPath = pathAlias("@", "packages.json");
    writeFileSync(aliasedPath, JSON.stringify(packageList, null, 2));
  }
};

const detectMissingPackages = (repos: ComposerPackages): string[] => {
  let missingPackages = [];

  for (const repo of Object.keys(repos.packages)) {
    let found = false;

    if (packageList.hasOwnProperty(repo)) {
      found = true;
      continue;
    } else {
      for (const key in packageList) {
        if (
          packageList[key].aliases &&
          packageList[key].aliases.includes(repo)
        ) {
          found = true;
          break;
        }
      }
    }

    if (!found) {
      missingPackages.push(repo);
    }
  }
  return missingPackages;
};

const askPackageDetails = async (
  name: string,
  pkg: ComposerPackage
): Promise<PackageDataType> => {
  const slug = name.split("/")[1];
  const vendor = await input({
    message: "Enter the vendor name",
    default: name.split("/")[0],
    validate: (input) =>
      input.length > 2
        ? true
        : "Vendor name is required to be 3 or more characters",
  });
  const ref = "";
  const version = "";
  const tags: string[] = [];
  const git = "";
  // const git = await input({
  //   message: "Enter the git url (optional)",
  //   validate: (input) =>
  //     input === "" || /^(https?|git):\/\/[^\s/$.?#].[^\s]*$/.test(input)
  //       ? true
  //       : "Please enter a valid URL",
  // });
  const aliases = [name];

  const key = Object.keys(pkg)[0];

  let type: "wordpress-plugin" | "wordpress-theme";
  if (pkg[key] && pkg[key].type) {
    type = pkg[key].type as "wordpress-plugin" | "wordpress-theme";
  } else {
    type = await select({
      message: "Select the package type",
      choices: [
        { name: "Plugin", value: "wordpress-plugin" },
        { name: "Theme", value: "wordpress-theme" },
      ],
    });
  }

  console.log(`\nAdding ${name} to the package list\n`);

  return {
    slug,
    vendor,
    ref,
    version,
    tags,
    git,
    aliases,
    type,
  };
};

import { promisify } from "util";
import { exec as execCallback } from "child_process";
import { Octokit } from "octokit";
import type { Auth } from "~/types/ComposerRepoList";
import type { Package } from "~/types/ComposerPackage";
import type { PackageDataType } from "~/types/PackageData";
import { pathAlias } from "./pathAlias";
import { env } from "~/env";
const fs = require("fs").promises;
const exec = promisify(execCallback);

/**
 * Creates a new GitHub repository under the specified organization.
 *
 * @param slug - The name of the repository to be created.
 * @param type - The type of the repository (e.g., 'wordpress').
 * @param token - (Optional) The GitHub authentication token. If not provided, it will be validated and set internally.
 * @param owner - (Optional) The owner of the organization under which the repository will be created. If not provided, it will be validated and set internally.
 * @returns A promise that resolves to the data of the created repository.
 *
 * @throws Will throw an error if the repository creation fails.
 */
export async function createGithubRepo(
  slug: string,
  type: string,
  token?: string,
  owner?: string
) {
  ({ token, owner } = validatePassedParams(token, owner));

  const octokit = new Octokit({
    auth: token,
  });

  const response = await octokit.request(`POST /orgs/${owner}/repos`, {
    org: owner,
    name: slug,
    description: `This Repository Tracks the ${slug} private wordpress ${type}.`,
    private: true,
    has_issues: false,
    has_projects: false,
    has_wiki: false,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return response.data;
}

/**
 * Checks if a GitHub repository exists within a specified organization.
 *
 * @param {string} slug - The repository name (slug) to check for existence.
 * @param {string} [token] - Optional GitHub personal access token for authentication.
 * @param {string} [owner] - Optional GitHub organization name. If not provided, it will be validated and set.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the repository exists, otherwise `false`.
 *
 * @throws {Error} - Throws an error if the validation of parameters fails or if the fetch request fails.
 */
export async function repoExists(slug: string, token?: string, owner?: string) {
  ({ token, owner } = validatePassedParams(token, owner));

  const octokit = new Octokit({
    auth: token,
  });

  try {
    await octokit.request(`GET /repos/${owner}/${slug}`, {
      owner: owner,
      repo: slug,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return true;
  } catch (error) {
    if (error instanceof Error && (error as any).status === 404) {
      return false;
    } else {
      throw error;
    }
  }
}

/**
 * Validates and retrieves the GitHub token and owner parameters.
 *
 * This function checks if the provided `token` and `owner` parameters are defined.
 * If not, it attempts to retrieve them from the environment variables `PAT` and `ORG`, respectively.
 * If neither the parameters nor the environment variables are set, it throws an error.
 *
 * @param {string | undefined} token - The GitHub token. If undefined, the function will attempt to use the `PAT` environment variable.
 * @param {string | undefined} owner - The GitHub organization or owner. If undefined, the function will attempt to use the `ORG` environment variable.
 * @returns {{ token: string, owner: string }} An object containing the validated `token` and `owner`.
 * @throws {Error} If neither the `token` parameter nor the `PAT` environment variable is set.
 * @throws {Error} If neither the `owner` parameter nor the `ORG` environment variable is set.
 */
function validatePassedParams(
  token: string | undefined,
  owner: string | undefined
) {
  if (!token) {
    token = process.env.PAT;
    if (!token) {
      throw new Error(
        "GitHub token is not provided and PAT environment variable is not set."
      );
    }
  }

  if (!owner) {
    owner = process.env.ORG;
    if (!owner) {
      throw new Error(
        "GitHub organization is not provided and ORG environment variable is not set."
      );
    }
  }
  return { token, owner };
}

/**
 * Removes a GitHub repository.
 *
 * @param {string} slug - The repository name.
 * @param {string} [token] - The GitHub personal access token. If not provided, it will be validated and assigned.
 * @param {string} [owner] - The owner of the repository. If not provided, it will be validated and assigned.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the repository was successfully removed, otherwise `false`.
 */
export async function removeRepo(slug: string, token?: string, owner?: string) {
  ({ token, owner } = validatePassedParams(token, owner));
  const url = `https://api.github.com/repos/${owner}/${slug}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const response = await fetch(url, {
    method: "DELETE",
    headers: headers,
  });

  return response.ok;
}

/**
 * Fetches all repositories for a given organization using the GitHub API.
 *
 * @param {string} token - The GitHub personal access token for authentication.
 * @param {string} owner - The name of the organization whose repositories are to be fetched.
 * @returns {Promise<any[]>} A promise that resolves to an array of repository objects.
 *
 * @throws {Error} Throws an error if the request fails.
 */
export async function fetchAllRepos(token: string, owner: string) {
  const octokit = new Octokit({
    auth: token,
  });

  const data = await octokit.paginate(`GET /orgs/${owner}/repos`, {
    owner: owner,
    per_page: 100,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return data;
}

/**
 * Clones a GitHub repository to a specified destination directory.
 *
 * @param {string} slug - The repository slug (name).
 * @param {string} dest - The destination directory where the repository will be cloned.
 * @param {string} [owner] - (Optional) The owner of the repository. If not provided, it will be validated and set internally.
 * @param {string} [token] - (Optional) The GitHub OAuth token for authentication. If not provided, it will be validated and set internally.
 * @returns {Promise<void>} A promise that resolves with the standard output of the clone operation, or rejects with an error message if the clone fails.
 */
export async function cloneGithubRepo(
  slug: string,
  dest: string,
  owner?: string,
  token?: string
) {
  ({ token, owner } = validatePassedParams(token, owner));

  const url = `https://oauth2:${token}@github.com/${owner}/${slug}.git`;

  try {
    await exec(`git clone ${url} ${dest}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error cloning repository: ${error.message}`);
    } else {
      throw new Error(`Error cloning repository: ${error}`);
    }
  }

  await configureGitUser();
}

/**
 * Configures the Git user information for the current repository.
 * Only sets the user name and email if they are not already configured.
 */

async function configureGitUser() {
  const gitConfig = async (key: string, value: string) => {
    try {
      const { stdout } = await exec(`git config --local --get ${key}`);
      if (!stdout.trim()) {
        console.log(`   -- Setting git ${key} to ${value}`);
        await exec(`git config ${key} "${value}"`);
      }
    } catch {
      console.log(`   -- Setting git ${key} to ${value}`);
      await exec(`git config ${key} "${value}"`);
    }
  };

  await gitConfig("user.name", "github-actions[bot]");
  await gitConfig("user.email", "github-actions[bot]@users.noreply.github.com");
}

/**
 * Initializes a new Git repository for a WordPress project.
 *
 * This function sets up a new repository by creating a `composer.json` file with the provided
 * details, configuring Git user information, and making an initial commit.
 *
 * @param {string} slug - The slug of the repository.
 * @param {string} type - The type of WordPress project (e.g., theme, plugin).
 * @param {string} theme - The theme associated with the repository.
 * @param {string} vendor - The vendor name for the repository.
 * @throws {Error} Throws an error if the repository initialization fails.
 * @returns {Promise<void>} A promise that resolves when the repository is successfully initialized.
 */
export async function initializeNewRepo(
  slug: string,
  dest: string,
  type: "wordpress-plugin" | "wordpress-theme",
  vendor: string
) {
  try {
    const simpleType = type.split("-")[1];
    const composerJson = `{
  "name": "${vendor === "" ? slug : vendor}/${slug}",
  "description": "Private Repo tracking the paid wordpress ${simpleType} ",
  "type": "${type}"
}`;

    const currentDir = process.cwd();
    process.chdir(dest);
    await configureGitUser();
    await exec(`echo '${composerJson}' >> composer.json`);
    await exec("rm -f .gitignore");
    await exec('echo " " >> .gitignore');
    await exec("git add *");
    await exec(`git commit -m "Prepare ${simpleType} Repo"`);
    await exec("git push");
    process.chdir(currentDir);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error initializing repository: ${error.message}`);
    } else {
      throw new Error(`Error initializing repository: ${error}`);
    }
  }
}

export async function removeGitFromLocalFiles(
  tempDir: string,
  packageDir: string
) {
  try {
    await exec("mkdir GitInfo", {
      cwd: tempDir,
    });
    const currentDir = process.cwd();
    process.chdir(packageDir);
    await exec("git init --separate-git-dir ../GitInfo/git");
    await exec("cp .git ../GitInfo/gitBackup");
    await exec("cat ../GitInfo/gitBackup");
    process.chdir(tempDir);
    await exec("rm -rf package");
    await exec("mkdir package");
    process.chdir(currentDir);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error removing git from local files: ${error.message}`);
    } else {
      throw new Error(`Error removing git from local files: ${error}`);
    }
  }
}

export async function cleanUpTempDir(tempDir?: string) {
  if (!tempDir) {
    tempDir = pathAlias("^");
  }
  try {
    await exec(`rm -rf ${tempDir}`);
    await exec(`mkdir -p ${tempDir}`);
    await exec(`touch ${tempDir}/.gitkeep`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error cleaning up temp directory: ${error.message}`);
    } else {
      throw new Error(`Error cleaning up temp directory: ${error}`);
    }
  }
}

export async function storeCurrentPackage(
  packageData: PackageDataType,
  tagData: Package,
  tagAuth: Auth | null,
  tempDir: string
) {
  if (!tagData.dist) {
    console.log("No dist data found for this tag");
    return;
  }
  const url = tagData.dist.url;

  const headers: Record<string, string> = {};
  if (tagAuth) {
    const auth = Buffer.from(
      `${tagAuth.username}:${tagAuth.password}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${auth}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch package: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(`${tempDir}/package.zip`, buffer);
  console.log(`   -- Package ${tagData.version} stored in temp directory`);

  await exec(`unzip package.zip -d package`, {
    cwd: tempDir,
  });

  await exec("rm package.zip", { cwd: tempDir });

  const unzippedDir = `${tempDir}/package`;
  let expectedDir = `${unzippedDir}/${packageData.slug}`;

  const dirExists = await fs
    .access(expectedDir)
    .then(() => true)
    .catch(() => false);

  if (!dirExists) {
    const files = await fs.readdir(unzippedDir);
    const directories = files.filter(async (file: string) => {
      const stat = await fs.stat(`${unzippedDir}/${file}`);
      return stat.isDirectory();
    });

    if (directories.length === 1) {
      const actualDir = directories[0];
      console.log(
        `  ** Expected directory not found.\n  ** Using ${actualDir} instead.`
      );
      expectedDir = `${unzippedDir}/${actualDir}`;
    } else {
      console.log(
        `  ** Expected directory ${expectedDir} does not exist and could not identify a single directory in ${unzippedDir}.`
      );
      console.log(`  ** Directories found: ${directories.join(", ")}`);
      console.log(
        `  ** Review the package structure and update the expected directory in the package data.`
      );
      return;
    }
  }

  // If the package developer has left a .git directory in the package, we need to remove it so that our .git does not get klobbered.

  const gitDir = `${expectedDir}/.git`;
  const gitDirExists = await fs
    .access(gitDir)
    .then(() => true)
    .catch(() => false);

  if (gitDirExists) {
    await exec(`rm -rf ${gitDir}`);
    console.log("   -- Removed existing .git directory from the package");
  }

  // put back the .git directory from the temp directory
  await exec(`cp ${tempDir}/GitInfo/gitBackup ${expectedDir}/.git`);
  console.log("   -- Copied .git directory to the package directory");

  const composerPath = `${expectedDir}/composer.json`;
  const composerExists = await fs
    .access(composerPath)
    .then(() => true)
    .catch(() => false);

  if (!composerExists) {
    console.log(
      "   -- Composer File Does Not Exist, checking out the initialized one."
    );
    await exec("git checkout -- composer.json", { cwd: expectedDir });
  } else {
    console.log("   -- Composer File Exists");
  }

  const currentDir = process.cwd();
  process.chdir(expectedDir);

  // Remove unnecessary files .gitignore and .github can mess with pushing files to the repo
  await exec("rm -rf .gitignore .github");

  await exec("git add -A");

  // Configure git user for commit
  await configureGitUser();

  const { stdout: gitStatus } = await exec("git status");
  if (gitStatus.includes("nothing to commit, working tree clean")) {
    console.log("   -- No changes to commit, skipping commit and push");
  } else {
    await exec(
      `git commit -m "Update ${packageData.slug} to ${tagData.version}"`
    );
    await exec("git push");
    console.log("   -- Committed changes for", tagData.version);
    try {
      await exec(`git tag ${tagData.version}`);
      await exec(`git push origin ${tagData.version}`);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes(`Command failed: git tag`)
      ) {
        console.log(
          `   -* Tag ${tagData.version} already exists. Deleting the tag and retrying.`
        );
        await exec(`git tag -d ${tagData.version}`);
        await exec(`git push origin :refs/tags/${tagData.version}`);
        await exec(`git tag ${tagData.version}`);
        await exec(`git push origin ${tagData.version}`);
      } else {
        throw error;
      }
    }
    console.log(
      `   -- Committed and pushed changes for ${tagData.version} to the repository`
    );
  }

  const { stdout: commitHash } = await exec("git rev-parse --short HEAD");
  packageData.ref = commitHash.trim();
  packageData.version = tagData.version;
  packageData.tags.push(tagData.version);

  const packagesFilePath = pathAlias("@", "packages.json");
  let packagesData: { [key: string]: PackageDataType } = {};

  try {
    const packagesFileContent = await fs.readFile(packagesFilePath, "utf-8");
    packagesData = JSON.parse(packagesFileContent);
  } catch (error) {
    if (error instanceof Error && (error as any).code === "ENOENT") {
      console.log(
        "   -- packages.json file does not exist. Creating a new one."
      );
    } else {
      if (error instanceof Error) {
        throw new Error(`Error reading packages.json file: ${error.message}`);
      } else {
        throw new Error("Unknown error reading packages.json file");
      }
    }
  }

  const packageKey = `${packageData.vendor}/${packageData.slug}`;

  if (packagesData[packageKey]) {
    packagesData[packageKey] = packageData;
  } else {
    packagesData[packageKey] = packageData;
  }

  await fs.writeFile(packagesFilePath, JSON.stringify(packagesData, null, 2));
  console.log(
    `   -- Updated packages.json with ${packageData.slug} version ${packageData.version}`
  );

  process.chdir(currentDir);

  await exec(`rm -rf ${unzippedDir}`);
}

export async function maybePushChanges(): Promise<boolean> {
  const { stdout: status } = await exec("git status --porcelain");

  if (status) {
    await exec('git config --global user.name "github-actions[bot]"');
    await exec(
      'git config --global user.email "github-actions[bot]@users.noreply.github.com"'
    );
    await exec("git add *");
    await exec('git commit -m "Update packages"');
    console.log("\n\n -- Changes committed");
  } else {
    console.log("\n\n -- No changes to commit");
  }

  const { stdout: behindStatus } = await exec(
    "git rev-list --count HEAD...@{upstream}"
  );

  if (parseInt(behindStatus) > 0) {
    console.log("\n\n Local repository is behind remote, pushing changes");
    const { stdout: remoteInfo } = await exec("git remote -v");
    try {
      if (!remoteInfo.includes("oauth2")) {
        await exec(
          `git remote set-url origin https://oauth2:${env.PAT}@github.com/${env.REPO}.git`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error updating remote origin: ${error.message}`);
      } else {
        throw new Error(`Error updating remote origin: ${error}`);
      }
    }

    await exec(`git push`);
    await exec(`git remote set-url origin https://github.com/${env.REPO}.git`);
    console.log(
      "\n *** /// All package changes pushed to the repository \\\\\\ ***"
    );
    return true;
  } else {
    console.log("\n\n Local repository is up to date with remote");
    return false;
  }
}

export async function pullChanges(): Promise<void> {
  try {
    await exec("git pull");
    console.log("\n\n -- Changes pulled from remote repository");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error pulling changes: ${error.message}`);
    } else {
      throw new Error(`Error pulling changes: ${error}`);
    }
  }
}
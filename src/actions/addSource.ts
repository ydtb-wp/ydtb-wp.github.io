import { input, select, confirm } from "@inquirer/prompts";
import { decrypt, encrypt } from "~/lib/encryption";
import data from "@/sources.json" assert { type: "json" };
import { writeFileSync } from "fs";
import { pathAlias } from "../lib/pathAlias";
import { existsSync } from "fs";
import type { ComposerRepoList, ComposerRepo } from "../types/ComposerRepoList";

// const sources = data as ComposerRepoList;

/**
 * Prompts the user to input details for adding a new Composer Repo Source.
 *
 * @returns {Promise<ComposerRepo>} A promise that resolves to a ComposerRepo object containing the source details.
 *
 * @throws {Error} If the username or password is empty when basic authentication is selected.
 *
 * @example
 * const repo = await askSource();
 * console.log(repo);
 */
export const askSource = async (): Promise<ComposerRepo> => {
  console.log("You are about to add a new Composer Repo Source");
  const name = await input({ message: "Enter the Source Name or Identifier." });
  const vendor = await input({ message: "Enter the Vendor Name/slug." });
  const url = await input({ message: "Enter the Source URL." });
  const auth_type: "basic" | "none" = await select({
    message: "Select the authentication type.",
    choices: [
      { name: "Basic", value: "basic" },
      { name: "None", value: "none" },
    ],
  });
  let auth = { username: "", password: "" };

  if (auth_type === "basic") {
    const username = await input({ message: "Enter the username." });
    const password = await input({ message: "Enter the password." });
    auth = { username, password };
  }

  if (auth_type === "none") {
    return { name, vendor, url, auth_type };
  }

  if (auth.username == "" || auth.password == "") {
    throw new Error("Username and password cannot be empty for basic auth.");
  }

  auth.username = encrypt(auth.username);
  auth.password = encrypt(auth.password);

  return {
    name,
    vendor,
    url,
    auth_type,
    auth,
  };
};

/**
 * Adds a new source to the composer repositories and writes the updated sources to a JSON file.
 *
 * @param {ComposerRepo} source - The source repository to be added.
 * @returns {Promise<void>} A promise that resolves when the source has been added and written to the file.
 * @throws {Error} If the path to the sources.json file does not exist.
 */
export const addSource = async (source: ComposerRepo): Promise<void> => {
  // const source = await askSource();
  const sources = data as ComposerRepoList;
  sources.composer_repos.push(source);
  const aliasedPath = pathAlias("@", "sources.json");

  if (!existsSync(aliasedPath)) {
    throw new Error(`Warning: The path ${aliasedPath} does not exist.`);
  }

  writeFileSync(aliasedPath, JSON.stringify(sources, null, 2));
  console.log();
  console.log("Source Written to: ");
  console.log(`${aliasedPath}`);
};

/**
 * Decrypts the sources file containing usernames and passwords.
 *
 * This function prompts the user for confirmation before proceeding with the decryption.
 * If the user confirms, it decrypts the source data and writes the decrypted data to a file.
 *
 * @returns {Promise<void>} A promise that resolves when the decryption process is complete.
 */
export const decryptSource = async (): Promise<void> => {
  console.log(
    "You are about to decrypt the sources file usernames and passwords."
  );

  const shouldContinue = await confirm({
    message: "Do you want to continue decrypting the file?",
    default: false,
  });

  if (!shouldContinue) {
    console.log("Decryption aborted.");
    return;
  }

  console.log("Proceeding with decryption...");
  // Proceed with decryption logic here
  const sources = data as ComposerRepoList;
  const decryptedSources = decryptSourceData(sources);

  const aliasedPath = pathAlias("@", "sources.json");
  writeFileSync(aliasedPath, JSON.stringify(decryptedSources, null, 2));

  console.log("Decryption complete.");
};

/**
 * Encrypts the usernames and passwords in the sources file.
 *
 * This function prompts the user for confirmation before proceeding with the encryption.
 * If the user confirms, it encrypts the `username` and `password` fields for each source
 * in the `composer_repos` array that uses basic authentication.
 * The updated sources are then written back to the `sources.json` file.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the encryption process is complete.
 */
export const encryptSource = async (): Promise<void> => {
  console.log(
    "You are about to encrypt the sources file usernames and passwords."
  );

  const shouldContinue = await confirm({
    message: "Do you want to continue encrypting the file?",
    default: false,
  });

  if (!shouldContinue) {
    console.log("Encryption aborted.");
    return;
  }

  console.log("Proceeding with encryption...");
  // Proceed with encryption logic here
  const sources = data as ComposerRepoList;
  for (const source of sources.composer_repos) {
    if (source.auth_type === "basic") {
      source.auth.username = encrypt(source.auth.username);
      source.auth.password = encrypt(source.auth.password);
    }
  }

  const aliasedPath = pathAlias("@", "sources.json");
  writeFileSync(aliasedPath, JSON.stringify(sources, null, 2));

  console.log("Encryption complete.");
};

/**
 * Decrypts the authentication data for each source in the provided ComposerRepoList.
 *
 * @param sources - The list of composer repositories containing authentication data to be decrypted.
 * @returns The updated ComposerRepoList with decrypted authentication data.
 */
export const decryptSourceData = (
  sources: ComposerRepoList
): ComposerRepoList => {
  for (const source of sources.composer_repos) {
    if (source.auth_type === "basic") {
      source.auth.username = decrypt(source.auth.username);
      source.auth.password = decrypt(source.auth.password);
    }
  }
  return sources;
};

/**
 * Retrieves the authentication information for a given vendor from the decrypted source data.
 *
 * @param {string} vendor - The name of the vendor to retrieve authentication information for.
 * @returns {(string | null)} The authentication information if found and the auth type is "basic", otherwise null.
 */
export const retrieveSourceAuth = (vendor: string) => {
  const sources = data as ComposerRepoList;

  const source = sources.composer_repos.find(
    (source) => source.vendor === vendor
  );
  if (source && source.auth_type === "basic") {
    return source.auth;
  }
  return null;
};

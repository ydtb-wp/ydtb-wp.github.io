/**
 * Resolves a given identifier to a specific path.
 *
 * @param Identifier - A string identifier that determines the path to resolve.
 *                     "@" resolves to the "../../data/" directory.
 *                     "~" resolves to the "../../src/" directory.
 * @returns The resolved path as a string.
 *
 * Note: The placement of this file is important, and the relative path of this file to the root directory should be maintained.
 */

import { resolve } from "path";

/**
 *
 * @param Identifier
 * @returns path
 */

export const pathAlias = (Identifier: string, path?: String): string => {
  let complete = "";
  if (Identifier == "@") {
    complete = resolve(__dirname, "../../data/");
  }

  if (Identifier == "~") {
    complete = resolve(__dirname, "../../src/");
  }

  if (Identifier == "^") {
    complete = resolve(__dirname, "../../temp/");
  }

  if (path) {
    if (!complete.endsWith("/")) {
      complete += "/";
    }
    complete += path;
  }

  return complete;
};

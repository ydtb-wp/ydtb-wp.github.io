#!/usr/bin/env bun

import { removeRepo, repoExists } from "~/lib/github";
import { rmSync, mkdirSync } from "fs";
import { pathAlias } from "~/lib/pathAlias";
import { writeFileSync } from "fs";

// const exists = await repoExists("sfwd-lms");
// console.log("The Repo exists:", exists);
// if (exists) {
//   await removeRepo("sfwd-lms");
//   console.log("Repo removed successfully");
// }

// const tempDir = pathAlias("^");

// rmSync(tempDir, { recursive: true, force: true });
// mkdirSync(tempDir);

// const gitkeepPath = `${tempDir}/.gitkeep`;
// writeFileSync(gitkeepPath, "");

// console.log("Temp directory reset successfully");

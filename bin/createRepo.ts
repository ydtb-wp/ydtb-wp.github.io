#!/usr/bin/env bun

import {
  createGithubRepo,
  fetchAllRepos,
  removeRepo,
  repoExists,
} from "~/lib/github";
import { env } from "~/env";

// const exists = await repoExists(env.PAT, env.ORG, "test-repo");

// if (!exists) {
//   await createGithubRepo(env.PAT, env.ORG, "test-repo", "plugin");
// }

// const repoWasRemoved = await removeRepo(
//   env.PAT,
//   env.ORG,
//   "test-repo"
// );

// console.log(repoWasRemoved);

const repoList = await fetchAllRepos(env.PAT, env.ORG);

for (const repo of repoList) {
  console.log(repo.full_name);
}

console.log(repoList.length);

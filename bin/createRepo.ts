#!/usr/bin/env bun

import {
  createGithubRepo,
  fetchAllRepos,
  removeRepo,
  repoExists,
} from "~/lib/github";
import { env } from "~/env";

// const exists = await repoExists(env.GITHUB_PAT, env.GITHUB_ORG, "test-repo");

// if (!exists) {
//   await createGithubRepo(env.GITHUB_PAT, env.GITHUB_ORG, "test-repo", "plugin");
// }

// const repoWasRemoved = await removeRepo(
//   env.GITHUB_PAT,
//   env.GITHUB_ORG,
//   "test-repo"
// );

// console.log(repoWasRemoved);

const repoList = await fetchAllRepos(env.GITHUB_PAT, env.GITHUB_ORG);

for (const repo of repoList) {
  console.log(repo.full_name);
}

console.log(repoList.length);

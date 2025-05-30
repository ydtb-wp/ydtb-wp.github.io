#!/usr/bin/env bun

import { chooseRepos } from "~/actions/chooseRepos";
import { maybePushChanges, pullChanges } from "~/lib/github";

const args = process.argv.slice(2);
const allFlag = args.includes('--all');

if (args.includes('-h') || args.includes('--help')) {
    console.log(`Usage: chooseRepos [options]

Options:
  --all       Choose all repositories: Take all defaults and just add all repositories
  -h, --help  Display this help message
`);
    process.exit(0);
}

await pullChanges();

if (allFlag) {
    chooseRepos(true);
} else {
    chooseRepos();
}

await maybePushChanges();
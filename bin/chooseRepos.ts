#!/usr/bin/env bun

import { chooseRepos } from "~/actions/chooseRepos";

const args = process.argv.slice(2);
const allFlag = args.includes('--all');

if (allFlag) {
    chooseRepos(true);
} else {
    chooseRepos();
}

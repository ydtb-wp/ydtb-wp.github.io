#!/usr/bin/env bun

import { listUpdates } from "~/actions/listUpdates";
import { updatePackages } from "~/actions/updatePackage";
import { cleanUpTempDir } from "~/lib/github";

const updates = await listUpdates();

for (const packageUpdate of updates) {
  const name = Object.keys(packageUpdate)[0];
  console.log(`\n---=== Running Update for ${name}  ===---`);
  await updatePackages(name, packageUpdate[Object.keys(packageUpdate)[0]]);
  await cleanUpTempDir();
}

#!/usr/bin/env bun

import { listUpdates } from "~/actions/listUpdates";
import { updatePackages } from "~/actions/updatePackage";
import { cleanUpTempDir, maybePushChanges } from "~/lib/github";

const updates = await listUpdates();

for (const packageUpdate of updates) {
  const name = Object.keys(packageUpdate)[0];
  console.log(`\n---=== Running Update for ${name}  ===---`);
  await updatePackages(name, packageUpdate[Object.keys(packageUpdate)[0]]);
  await cleanUpTempDir();
}

const changesPushed = await maybePushChanges();

if (changesPushed) {
  process.exit(10); // Success there is an update that needs to be generated
} else {
  process.exit(0); // No updates were pushed, nothing to do
}

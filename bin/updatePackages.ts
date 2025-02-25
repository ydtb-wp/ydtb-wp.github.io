#!/usr/bin/env bun

import { listUpdates } from "~/actions/listUpdates";
import { updatePackages } from "~/actions/updatePackage";
import { cleanUpTempDir, maybePushChanges } from "~/lib/github";

const updates = await listUpdates();

for (const packageUpdate of updates) {
  const name = Object.keys(packageUpdate)[0];
  await updatePackages(name, packageUpdate[Object.keys(packageUpdate)[0]]);
  await cleanUpTempDir();
}

const changesPushed = await maybePushChanges();

if (changesPushed) {
  process.exit(0); // Success there is an update that needs to be generated
} else {
  process.exit(10); // No updates were pushed, nothing to do, end here.
}

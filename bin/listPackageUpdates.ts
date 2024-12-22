#!/usr/bin/env bun

import { listUpdates } from "~/actions/listUpdates";

const updates = await listUpdates();

updates.forEach((packageUpdate) => {
  console.log("\n---===  ===---");
  console.log(Object.keys(packageUpdate)[0]);
  const tags = packageUpdate[Object.keys(packageUpdate)[0]];
  console.log(tags.map((tag) => Object.keys(tag)).join(", "));
});

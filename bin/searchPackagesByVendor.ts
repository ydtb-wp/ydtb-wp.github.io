#!/usr/bin/env bun

import * as fs from "fs";
import * as path from "path";

// Define the path to the packages.json file
const packagesFilePath = path.join(__dirname, "../data/packages.json");

// Get the vendor prefix from the command line arguments
const vendorPrefix = process.argv[2] || "ydtb/";
let filterActive = true;

if (vendorPrefix === "/") {
  filterActive = false;
}
// Read the packages.json file
fs.readFile(packagesFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading packages.json file:", err);
    return;
  }

  // Parse the JSON data
  const packages = JSON.parse(data);

  let filteredPackages;

  if (filterActive) {
    // Filter and list packages that start with the vendor prefix
    filteredPackages = Object.keys(packages).filter((pkg) =>
      pkg.startsWith(vendorPrefix)
    );
  } else {
    // List all packages without filtering
    filteredPackages = Object.keys(packages);
  }

  // Print the list of filtered packages
  console.log(filteredPackages.join("\n"));
});

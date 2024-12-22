export type PackageDataType = {
  slug: string;
  vendor: string;
  ref: string;
  version: string;
  tags: string[];
  git: string;
  aliases: string[];
  type: "wordpress-plugin" | "wordpress-theme";
};

export type PackageListType = {
  [key: string]: PackageDataType;
};

export type PackageDataType = {
  slug: string;
  vendor: string;
  ref: string;
  version: string;
  tags: string[];
};

export type ComposerListType = {
  [key: string]: PackageDataType;
};

export type DatabaseJson = {
  plugins: ComposerListType;
  themes: ComposerListType;
};

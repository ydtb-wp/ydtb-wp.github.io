export type Package = {
  name: string;
  version: string;
  version_normalized?: string;
  dist?: {
    type: string;
    url: string;
    shasum?: string;
  };
  source?: {
    type: string;
    url: string;
    reference: string;
  };
  require?: {
    [key: string]: string;
  };
  type: string;
  authors?: {
    name: string;
    homepage: string;
  }[];
  description?: string;
  homepage?: string;
} & (
  | { dist: { type: string; url: string; shasum: string } }
  | { source: { type: string; url: string; reference: string } }
);

export type ComposerPackage = {
  [version: string]: Package;
};

export type ComposerPackages = {
  packages: {
    [key: string]: ComposerPackage;
  };
};

export type ComposerPackageRequest = {
  code: "success";
  data: ComposerPackages;
};

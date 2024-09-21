export type PluginType = {
  slug: string;
  vendor: string;
  ref: string;
  version: string;
  tags: string[];
};

export type PluginListType = {
  [key: string]: PluginType;
};

export type PackageJson = {
  packages: Packages;
};

export type Package = {
  name: string;
  version: string;
  dist: {
    type: string;
    url: string;
  };
  source: {
    type: string;
    url: string;
    reference: string;
  };
  type: string;
  description: string;
};

export type Packages = {
  [packageName: string]: {
    [version: string]: Package;
  };
};

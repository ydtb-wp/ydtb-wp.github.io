type Auth = {
  username: string;
  password: string;
};
type Repo = {
  name: string;
  vendor: string;
  url: string;
};
type RepoNoAuth = {
  auth_type: "none";
};
type RepoBasicAuth = {
  auth_type: "basic";
  auth: Auth;
};
export type ComposerRepo = Repo & (RepoNoAuth | RepoBasicAuth);

export type ComposerRepoList = {
  composer_repos: ComposerRepo[];
};

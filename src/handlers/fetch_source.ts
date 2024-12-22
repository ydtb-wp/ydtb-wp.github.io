import data from "@/sources.json" assert { type: "json" };
import { decryptSourceData } from "~/actions/addSource";
import type { BadRequest, UnAuthorized } from "~/types/bad_request";
import type {
  ComposerPackage,
  ComposerPackageRequest,
  ComposerPackages,
} from "~/types/ComposerPackage";
import type { ComposerRepo, ComposerRepoList } from "~/types/ComposerRepoList";

const sources = (data as ComposerRepoList).composer_repos;

/** Response type intersection */
type PackageResponse =
  | (Omit<Response, "json"> & {
      status: 200 | 201;
      json: () => ComposerPackages | PromiseLike<ComposerPackages>;
    })
  | (Omit<Response, "json"> & {
      status: 400;
      json: () => BadRequest | PromiseLike<BadRequest>;
    })
  | (Omit<Response, "json"> & {
      status: 401;
      json: () => UnAuthorized | PromiseLike<UnAuthorized>;
    });

/** Marshalling stream to object with narrowing */
const marshalResponse = async (res: PackageResponse) => {
  if (res.status === 200 || res.status === 201)
    return {
      code: "success",
      data: await res.json(),
    } as ComposerPackageRequest;
  if (res.status === 400)
    return { code: "bad_request", message: "Bad Request" } as BadRequest;
  if (res.status === 401)
    return { code: "unauthorized", message: "Unauthorized" } as UnAuthorized;
  return Error("Unhandled response code");
};

/** Coerce Response to UserResponse */
const responseHandler = async (response: Response) => {
  const res = response as PackageResponse;
  return await marshalResponse(res);
};

export const fetchSource = async (
  source: ComposerRepo
): Promise<ComposerPackageRequest | BadRequest | UnAuthorized> => {
  let response: Response;
  if (source.auth_type === "none") {
    response = await fetch(source.url, {
      method: "GET",
    });
  } else {
    response = await fetch(source.url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(
          `${source.auth?.username}:${source.auth?.password}`
        )}`,
      },
    });
  }

  const result = await responseHandler(response);
  if (result instanceof Error) {
    throw result;
  }

  return result;
};

export const fetchAllPackages = async (): Promise<ComposerPackages> => {
  let all: ComposerPackages = {
    packages: {},
  };

  const decryptedSources = decryptSourceData({ composer_repos: sources });

  for (const source of decryptedSources.composer_repos) {
    const sourceRequest = await fetchSource(source);

    if (sourceRequest.code === "success") {
      for (const [packageName, packageVersions] of Object.entries(
        sourceRequest.data.packages
      )) {
        if (!all.packages[packageName]) {
          all.packages[packageName] = {};
        }
        Object.assign(all.packages[packageName], packageVersions);
      }
    }
  }

  return all;
};

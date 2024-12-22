import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import 'dotenv/config';

export const env = createEnv({
  server: {
    VAULT_PASS: z.string(),
    GITHUB_PAT: z.string(),
    GITHUB_ORG: z.string(),
  },
  client: {},
  runtimeEnv: {
    VAULT_PASS: process.env.VAULT_PASS,
    GITHUB_PAT: process.env.PAT,
    GITHUB_ORG: process.env.ORG,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

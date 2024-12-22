import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import 'dotenv/config';

export const env = createEnv({
  server: {
    VAULT_PASS: z.string(),
    PAT: z.string(),
    ORG: z.string(),
    REPO: z.string(),
  },
  client: {},
  runtimeEnv: {
    VAULT_PASS: process.env.VAULT_PASS,
    PAT: process.env.PAT,
    ORG: process.env.ORG,
    REPO: process.env.REPO,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

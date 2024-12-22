import * as crypto from "crypto";
import { env } from "~/env";

const algorithm = "aes-256-cbc";
const key = crypto.createHash("sha256").update(env.VAULT_PASS).digest(); //32 bytes = 256 bits

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16); // 16 bytes = 128 bits
  const cipher = crypto.createCipheriv(
    algorithm,
    new Uint8Array(key),
    new Uint8Array(iv)
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const ivHex = iv.toString("hex");
  encrypted = ivHex + ":" + encrypted;
  return Buffer.from(encrypted).toString("base64");
};

export const decrypt = (encryptedText: string): string => {
  const encrypted = Buffer.from(encryptedText, "base64").toString();
  const parts = encrypted.split(":");
  const iv = Buffer.from(parts[0], "hex");
  encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(
    algorithm,
    new Uint8Array(key),
    new Uint8Array(iv)
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

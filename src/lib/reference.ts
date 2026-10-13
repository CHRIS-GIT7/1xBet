import { randomBytes } from "node:crypto";

// Ambiguous characters (0/O, 1/I/L) removed so customers can read the ID aloud.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Produces references like `1XB-2F8K-DM4Z`. */
export function generateReference(): string {
  const bytes = randomBytes(8);
  let core = "";
  for (const b of bytes) core += ALPHABET[b % ALPHABET.length];
  return `1XB-${core.slice(0, 4)}-${core.slice(4)}`;
}

export const REFERENCE_PATTERN = /^1XB-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

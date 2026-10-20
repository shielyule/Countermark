export type SupportedMime = "application/pdf" | "image/png" | "image/jpeg";

export function bufferFromBase64(base64: string): Buffer {
  return Buffer.from(base64.replace(/\s/g, ""), "base64");
}

/** Prefer file contents over the browser-reported MIME when they disagree. */
export function resolveMimeType(
  declared: string,
  buffer: Buffer,
): SupportedMime | null {
  const sniffed = sniffMime(buffer);
  if (sniffed) {
    return sniffed;
  }
  if (
    declared === "application/pdf" ||
    declared === "image/png" ||
    declared === "image/jpeg"
  ) {
    return declared;
  }
  return null;
}

function sniffMime(buffer: Buffer): SupportedMime | null {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  return null;
}

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "application/pdf",
]);

export function validateFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) {
    return "Please upload a PNG, JPG, or PDF under 10MB.";
  }
  if (file.size > MAX_BYTES) {
    return "Please upload a PNG, JPG, or PDF under 10MB.";
  }
  return null;
}

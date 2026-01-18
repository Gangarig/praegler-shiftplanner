export function formatPbError(err) {
  // PocketBase errors often look like:
  // { status: 400, message: "Failed to create record.", data: { field: { message } } }

  if (!err) return "Unknown error";

  // Network / server down
  if (err?.status === 0 || err?.message?.includes("Failed to fetch")) {
    return "Cannot reach PocketBase server. Is it running?";
  }

  // Field validation errors
  const data = err?.data;
  if (data && typeof data === "object") {
    const parts = [];

    // pocketbase usually uses data.data for field errors in some versions,
    // but we’ll handle both shapes safely.
    const fieldErrors = data?.data || data;

    if (fieldErrors && typeof fieldErrors === "object") {
      for (const [field, info] of Object.entries(fieldErrors)) {
        const msg =
          info?.message ||
          (typeof info === "string" ? info : null) ||
          "Invalid value";
        // skip empty objects
        if (msg && msg !== "[object Object]") parts.push(`${field}: ${msg}`);
      }
    }

    if (parts.length) return parts.join("\n");
  }

  // Fallback
  return err?.message || "Request failed";
}

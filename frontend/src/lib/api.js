import { formatPbError } from "./pbError";

export async function safeCall(fn) {
  try {
    const res = await fn();
    return { ok: true, data: res, error: null };
  } catch (e) {
    return {
      ok: false,
      data: null,
      error: formatPbError(e),
      raw: e,
    };
  }
}

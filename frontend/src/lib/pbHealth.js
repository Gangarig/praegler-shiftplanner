import pb from "./pb";

let lastOk = 0;

export async function ensurePbAlive() {
  const now = Date.now();
  if (now - lastOk < 2000) return true;

  try {
    await pb.health.check();
    lastOk = now;
    return true;
  } catch {
    return false;
  }
}

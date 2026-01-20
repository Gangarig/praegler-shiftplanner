import pb from "@/lib/pb";

export function getRole() {
  return pb.authStore.model?.role || null;
}

export function isWorker() {
  return getRole() === "worker";
}

export function isBoss() {
  return getRole() === "boss";
}

export function isAdmin() {
  return getRole() === "admin";
}

export function isAdminOrBoss() {
  const r = getRole();
  return r === "admin" || r === "boss";
}

import pb from "./pb";

/* ========= SESSION ========= */

export function isAuthed() {
  return pb.authStore.isValid;
}

export function getUser() {
  return pb.authStore.model;
}

export function logout() {
  pb.authStore.clear();
}

/* ========= AUTH ACTIONS ========= */

export async function login(email, password) {
  return pb.collection("users").authWithPassword(email, password);

}

export async function requestPasswordReset(email) {
  return pb.collection("users").requestPasswordReset(email);
}

/* ========= ADMIN ONLY ========= */
/**
 * IMPORTANT:
 * - This must only be called by admin/boss
 * - PocketBase rules should enforce this
 */
export async function createWorker({ name, email, password }) {
  return pb.collection("users").create({
    name,
    email,
    password,
    passwordConfirm: password,
    role: "worker",
    active: true,
  });
}

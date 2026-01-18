import pb from "@/lib/pb";

export function listActiveUsers() {
  return pb.collection("users").getFullList({
    sort: "name",
    filter: "active = true",
  });
}

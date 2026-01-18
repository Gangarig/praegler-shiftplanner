import pb from "@/lib/pb";

export function listAbsences() {
  return pb.collection("absences").getFullList({
    sort: "-startAt",
    expand: "worker",
  });
}

export function createAbsence(data) {
  return pb.collection("absences").create(data);
}

export function deleteAbsence(id) {
  return pb.collection("absences").delete(id);
}

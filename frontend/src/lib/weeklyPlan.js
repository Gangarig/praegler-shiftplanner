import pb from "@/lib/pb";

export async function loadWeeklyPlan(weekStartYMD) {
  const filter = `weekStartYMD="${weekStartYMD}"`;
  try {
    const rec = await pb.collection("weekly_plans").getFirstListItem(filter);
    return rec; // {id, weekStartYMD, data, ...}
  } catch {
    return null;
  }
}

export async function saveWeeklyPlan({ weekStartYMD, data }) {
  const filter = `weekStartYMD="${weekStartYMD}"`;
  const existing = await loadWeeklyPlan(weekStartYMD);

  const payload = {
    weekStartYMD,
    data,
    updatedBy: pb.authStore.model?.id || null,
  };

  if (existing) {
    return pb.collection("weekly_plans").update(existing.id, payload);
  }
  return pb.collection("weekly_plans").create(payload);
}
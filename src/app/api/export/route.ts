import { currentUser, db } from "@/lib/db";
export async function GET() {
  const u = await currentUser(), w = { where: { userId: u.id } };
  const data = {
    user: { email: u.email, name: u.name }, entries: await db.journalEntry.findMany(w), promises: await db.promise.findMany(w),
    projects: await db.project.findMany({ ...w, include: { tasks: true } }), meetings: await db.meeting.findMany(w), goals: await db.goal.findMany(w),
    milestones: await db.milestone.findMany(w), plans: await db.dailyPlan.findMany(w), visions: await db.yearVision.findMany(w), words: await db.dailyWord.findMany(w),
  };
  return new Response(JSON.stringify(data, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="selah-export.json"' } });
}

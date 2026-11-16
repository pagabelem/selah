import { currentUser, db } from "@/lib/db";
const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
export async function GET() {
  const u = await currentUser();
  const ms = await db.meeting.findMany({ where: { userId: u.id } });
  const ev = ms.map((m) => `BEGIN:VEVENT\r\nUID:${m.id}@selah\r\nDTSTAMP:${f(new Date())}\r\nDTSTART:${f(m.startsAt)}\r\nDTEND:${f(m.endsAt ?? new Date(m.startsAt.getTime() + 36e5))}\r\nSUMMARY:${m.title}\r\nLOCATION:${m.place ?? ""}\r\nEND:VEVENT`).join("\r\n");
  return new Response(`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Selah//FR\r\n${ev}\r\nEND:VCALENDAR`, { headers: { "Content-Type": "text/calendar", "Content-Disposition": 'attachment; filename="selah.ics"' } });
}

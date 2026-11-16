"use client";
import { Bell } from "lucide-react";
const b64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
export default function PushButton() {
  async function enable() {
    const reg = await navigator.serviceWorker.register("/sw.js");
    if ((await Notification.requestPermission()) !== "granted") return;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) });
    await fetch("/api/push/subscribe", { method: "POST", body: JSON.stringify(sub) });
  }
  return <button onClick={enable} className="btn flex items-center gap-2 !px-4 !py-2 text-sm"><Bell size={16} /> Activer les notifications</button>;
}

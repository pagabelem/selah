const base = () => `${process.env.SUPABASE_URL}/storage/v1`;
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;
const H = () => ({ Authorization: `Bearer ${key()}`, apikey: key() });
const B = () => process.env.SUPABASE_BUCKET!;
export async function upload(path: string, file: File) {
  const r = await fetch(`${base()}/object/${B()}/${path}`, { method: "POST", headers: { ...H(), "Content-Type": file.type || "application/octet-stream", "x-upsert": "true" }, body: new Uint8Array(await file.arrayBuffer()) });
  if (!r.ok) throw new Error("upload");
}
export async function removeObject(path: string) {
  await fetch(`${base()}/object/${B()}/${path}`, { method: "DELETE", headers: H() });
}
export async function signedUrl(path: string, secs = 3600) {
  const r = await fetch(`${base()}/object/sign/${B()}/${path}`, { method: "POST", headers: { ...H(), "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: secs }) });
  if (!r.ok) return null;
  return `${base()}${(await r.json()).signedURL}`;
}
export const sha = async (s: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("selah:" + s)))).map((b) => b.toString(16).padStart(2, "0")).join("");

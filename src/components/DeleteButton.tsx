"use client";
import { remove } from "@/app/actions3";
type P = { id: string; entity?: string; to?: string; op?: string; label?: string; action?: (fd: FormData) => Promise<void> };
export default function DeleteButton({ id, entity, to, op, label = "Supprimer", action = remove }: P) {
  return (
    <form  data-toast="Supprimé ✓"    action={action} onSubmit={(e) => { if (!confirm("Supprimer définitivement ? Cette action est irréversible.")) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      {entity && <input type="hidden" name="entity" value={entity} />}
      {to && <input type="hidden" name="to" value={to} />}
      {op && <input type="hidden" name="op" value={op} />}
      <button className="text-sm text-red-300 hover:text-red-200">🗑 {label}</button>
    </form>
  );
}

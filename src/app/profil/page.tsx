import { currentUser } from "@/lib/db";
import { updateProfile, changePassword, deleteAccount } from "./actions";
export const dynamic = "force-dynamic";
const ok: Record<string, string> = { "1": "Profil enregistré.", pw: "Mot de passe modifié." };
const err: Record<string, string> = { email: "E-mail invalide ou déjà utilisé.", pw: "Mot de passe actuel incorrect, ou nouveau trop court (8 min.).", del: "Confirmation incorrecte.", last: "Impossible : vous êtes le dernier administrateur." };
export default async function Profil({ searchParams }: { searchParams: { ok?: string; e?: string } }) {
  const u = await currentUser();
  return (
    <div className="space-y-6">
      <h2 className="gold-text font-serif text-5xl">Mon profil</h2>
      {searchParams.ok && <p className="text-emerald-300">{ok[searchParams.ok]}</p>}{searchParams.e && <p className="text-red-300">{err[searchParams.e]}</p>}
      <form action={updateProfile} className="glass space-y-3 p-6"><h3 className="font-serif text-2xl">Informations</h3>
        <input name="name" defaultValue={u.name ?? ""} placeholder="Prénom / nom" className="input" /><input name="email" type="email" required defaultValue={u.email} className="input" />
        <input name="timezone" list="tz" defaultValue={u.timezone} className="input" /><datalist id="tz">{["Africa/Casablanca", "Europe/Paris", "Europe/Brussels", "America/Montreal", "UTC"].map((z) => <option key={z} value={z} />)}</datalist>
        <select name="locale" defaultValue={u.locale} className="input"><option value="fr">Français</option><option value="en">English</option></select><button className="btn">Enregistrer</button></form>
      <form action={changePassword} className="glass space-y-3 p-6"><h3 className="font-serif text-2xl">Mot de passe</h3>
        <input name="current" type="password" required placeholder="Mot de passe actuel" className="input" /><input name="new" type="password" required minLength={8} placeholder="Nouveau mot de passe (8+)" className="input" /><button className="btn">Modifier</button></form>
      <form action={deleteAccount} className="glass space-y-3 p-6"><h3 className="font-serif text-2xl text-red-300">Supprimer mon compte</h3>
        <p className="text-sm opacity-70">Toutes vos données seront effacées définitivement. Tapez votre e-mail pour confirmer.</p>
        <input name="email" placeholder={u.email} className="input" /><button className="text-red-300">Supprimer définitivement</button></form>
    </div>
  );
}

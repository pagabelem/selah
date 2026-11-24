import { currentUser } from "@/lib/db";
import { logout } from "@/app/login/actions";
import { signedUrl } from "@/lib/storage";
import { updateProfile, changePassword, deleteAccount } from "./actions";
import { uploadAvatar } from "./files";
export const dynamic = "force-dynamic";
const ok: Record<string, string> = { "1": "Profil enregistré.", pw: "Mot de passe modifié.", img: "Photo de profil mise à jour." };
const err: Record<string, string> = { email: "E-mail invalide ou déjà utilisé.", pw: "Mot de passe actuel incorrect, ou nouveau trop court (8 min.).", del: "Confirmation incorrecte.", last: "Impossible : vous êtes le dernier administrateur.", img: "Image invalide (JPG, PNG ou WebP, 2 Mo max) ou stockage non configuré." };
export default async function Profil({ searchParams }: { searchParams: { ok?: string; e?: string } }) {
  const u = await currentUser(), avatar = u.avatarPath ? await signedUrl(u.avatarPath) : null;
  return (
    <div className="space-y-6">
      <h2 className="gold-text font-serif text-5xl">Mon profil</h2>
      {searchParams.ok && <p className="text-emerald-300">{ok[searchParams.ok]}</p>}{searchParams.e && <p className="text-red-300">{err[searchParams.e]}</p>}
      <form data-no-toast action={uploadAvatar} className="glass flex flex-wrap items-center gap-5 p-6">
        {avatar
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={avatar} alt="Photo de profil" className="h-24 w-24 rounded-full object-cover ring-2 ring-gold/60" />
          : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gold/20 font-serif text-4xl text-gold">{(u.name ?? u.email)[0].toUpperCase()}</div>}
        <div className="flex-1 space-y-2"><h3 className="font-serif text-2xl">Photo de profil</h3>
          <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required className="input" /><button className="btn">Mettre à jour la photo</button>
          <p className="text-xs opacity-60">JPG, PNG ou WebP, 2 Mo maximum.</p></div>
      </form>
      <form data-no-toast action={updateProfile} className="glass space-y-3 p-6"><h3 className="font-serif text-2xl">Informations</h3>
        <input name="name" defaultValue={u.name ?? ""} placeholder="Prénom / nom" className="input" /><input name="email" type="email" required defaultValue={u.email} className="input" />
        <input name="timezone" list="tz" defaultValue={u.timezone} className="input" /><datalist id="tz">{["Africa/Casablanca", "Europe/Paris", "Europe/Brussels", "America/Montreal", "UTC"].map((z) => <option key={z} value={z} />)}</datalist>
        <select name="locale" defaultValue={u.locale} className="input"><option value="fr">Français</option><option value="en">English</option></select><button className="btn">Enregistrer</button></form>
      <form data-no-toast action={changePassword} className="glass space-y-3 p-6"><h3 className="font-serif text-2xl">Mot de passe</h3>
        <input name="current" type="password" required placeholder="Mot de passe actuel" className="input" /><input name="new" type="password" required minLength={8} placeholder="Nouveau mot de passe (8+)" className="input" /><button className="btn">Modifier</button></form>
      <form data-no-toast action={logout} className="glass flex items-center justify-between p-6"><div><h3 className="font-serif text-2xl">Session</h3><p className="text-sm opacity-70">Connecté en tant que {u.email}</p></div><button className="btn">Se déconnecter</button></form>
      <form data-no-toast action={deleteAccount} className="glass space-y-3 p-6"><h3 className="font-serif text-2xl text-red-300">Supprimer mon compte</h3>
        <p className="text-sm opacity-70">Toutes vos données seront effacées définitivement. Tapez votre e-mail pour confirmer.</p>
        <input name="email" placeholder={u.email} className="input" /><button className="text-red-300">Supprimer définitivement</button></form>
    </div>
  );
}
import { login, register } from "./actions";
export default function Login({ searchParams }: { searchParams: { e?: string } }) {
  return (
    <div className="mx-auto mt-16 max-w-md space-y-6 text-center">
      <h1 className="gold-text font-serif text-6xl">Selah</h1>
      {searchParams.e && <p className="text-red-300">{({ "1": "Identifiants incorrects.", "2": "Inscription impossible (mot de passe ≥ 8 caractères, e-mail unique).", "3": "Compte en attente de validation par l'administrateur.", "4": "Ce compte est bloqué.", "5": "Compte créé : un administrateur doit l'activer avant votre première connexion." } as Record<string, string>)[searchParams.e]}</p>}
      <form action={login} className="glass space-y-3 p-6"><h2 className="font-serif text-2xl">Connexion</h2>
        <input name="email" type="email" required placeholder="E-mail" className="input" /><input name="password" type="password" required placeholder="Mot de passe" className="input" /><button className="btn w-full">Entrer</button></form>
      <form action={register} className="glass space-y-3 p-6"><h2 className="font-serif text-2xl">Créer un compte</h2>
        <input name="name" placeholder="Prénom" className="input" /><input name="email" type="email" required placeholder="E-mail" className="input" /><input name="password" type="password" required minLength={8} placeholder="Mot de passe (8+)" className="input" /><button className="btn w-full">S'inscrire</button></form>
    </div>
  );
}

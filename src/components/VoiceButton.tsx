"use client";
export default function VoiceButton({ target }: { target: string }) {
  function go() {
    const w = window as any, SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return alert("Dictée vocale non supportée par ce navigateur.");
    const r = new SR(); r.lang = "fr-FR"; r.continuous = true;
    r.onresult = (e: any) => {
      const el = document.querySelector(`[name=${target}]`) as HTMLTextAreaElement;
      el.value += " " + Array.from(e.results).slice(e.resultIndex).filter((x: any) => x.isFinal).map((x: any) => x[0].transcript).join(" ");
    };
    r.start(); setTimeout(() => r.stop(), 90000);
  }
  return <button type="button" onClick={go} className="rounded-full border border-gold/50 px-5 py-2 text-gold">🎙 Dicter</button>;
}

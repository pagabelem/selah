export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="glass h-14 w-64 animate-pulse" />
      <div className="glass h-40 animate-pulse" />
      <div className="glass h-40 animate-pulse" />
    </div>
  );
}
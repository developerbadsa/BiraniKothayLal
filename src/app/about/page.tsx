export default function AboutPage() {
  return (
    <div className="space-y-3 rounded-2xl border bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-semibold">About BiraniKothayLal</h1>
      <p className="text-slate-700">This community tracker helps people in Lalmonirhat find iftar/biriyani availability near mosques. Reports are anonymous and best-effort.</p>
      <ul className="list-disc space-y-1 pl-5 text-slate-700">
        <li>Be respectful when reporting.</li>
        <li>Do not spam votes or submissions.</li>
        <li>Always verify on-ground before relying fully.</li>
      </ul>
    </div>
  );
}

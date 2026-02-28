import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VoteButtons } from "@/components/VoteButtons";
import { formatTime } from "@/lib/format";
import { env } from "@/lib/env";
import { connectDb } from "@/lib/db";
import { Mosque } from "@/models/Mosque";
import { Vote } from "@/models/Vote";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  await connectDb();
  const { id } = await params;
  const mosque = await Mosque.findById(id).lean();
  if (!mosque) return { title: "Not found" };

  const title = `${mosque.name} — BiraniKothayLal (Lalmonirhat)`;
  const description = `${mosque.area} community reported iftar/biriyani availability.`;
  return {
    title,
    description,
    alternates: { canonical: `${env.NEXT_PUBLIC_APP_URL}/mosque/${id}` },
    openGraph: { title, description, siteName: "BiraniKothayLal" },
  };
}

export default async function MosqueDetail({ params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  const { id } = await params;
  const mosque = await Mosque.findById(id).lean();
  if (!mosque) notFound();

  const votes = await Vote.find({ mosqueId: id }).sort({ createdAt: -1 }).limit(20).lean();
  const [lng, lat] = mosque.location.coordinates;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: mosque.name,
    address: mosque.address,
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    url: `${env.NEXT_PUBLIC_APP_URL}/mosque/${id}`,
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{mosque.name}</h1>
      <p className="text-slate-600">{mosque.area} · {mosque.address || "-"}</p>
      <div className="rounded-2xl border bg-white p-4 shadow-soft">
        <p>YES: {mosque.aggregates.yesCount} | NO: {mosque.aggregates.noCount}</p>
        <p>Confidence: {(mosque.aggregates.confidenceScore * 100).toFixed(1)}%</p>
        <p>Last report: {formatTime(mosque.aggregates.lastVotedAt)}</p>
      </div>
      <VoteButtons mosqueId={id} />
      <section className="rounded-2xl border bg-white p-4 shadow-soft">
        <h2 className="mb-2 font-semibold">Last 20 reports</h2>
        <ul className="space-y-1 text-sm text-slate-600">
          {votes.map((v) => (
            <li key={v._id.toString()}>{v.voteType} · {formatTime(v.createdAt)}</li>
          ))}
        </ul>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}

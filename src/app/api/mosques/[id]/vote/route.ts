import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { getVoterKeyHash } from "@/lib/hash";
import { refreshAggregates } from "@/lib/mosque";
import { checkVoteRateLimit } from "@/lib/rate-limit";
import { voteSchema } from "@/lib/validation";
import { Mosque } from "@/models/Mosque";
import { Vote } from "@/models/Vote";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const parse = voteSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

  const mosque = await Mosque.findById(id).lean();
  if (!mosque || mosque.status !== "ACTIVE") return NextResponse.json({ error: "Mosque not found" }, { status: 404 });

  const voterKeyHash = await getVoterKeyHash();
  const rate = await checkVoteRateLimit(voterKeyHash, id);
  if (!rate.ok) return NextResponse.json({ error: "Rate limited", nextAllowedAt: rate.nextAllowedAt }, { status: 429 });

  await Vote.create({ mosqueId: id, voteType: parse.data.voteType, voterKeyHash });
  const aggregates = await refreshAggregates(id);

  return NextResponse.json({ ok: true, aggregates });
}

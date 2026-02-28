import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { getVoterKeyHash } from "@/lib/hash";
import { createMosqueSchema, queryMosqueSchema } from "@/lib/validation";
import { Mosque } from "@/models/Mosque";
import { SubmissionRate } from "@/models/SubmissionRate";

export async function GET(req: NextRequest) {
  await connectDb();
  const parse = queryMosqueSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams.entries()));
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

  const { query, area, page, limit } = parse.data;
  const filter: Record<string, unknown> = { status: "ACTIVE" };
  if (area) filter.area = area;
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { address: { $regex: query, $options: "i" } },
      { area: { $regex: query, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Mosque.find(filter)
      .sort({ "aggregates.lastVotedAt": -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Mosque.countDocuments(filter),
  ]);

  const res = NextResponse.json({ items, total, page, limit });
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res;
}

export async function POST(req: NextRequest) {
  await connectDb();
  const voterKeyHash = await getVoterKeyHash();
  const body = await req.json();
  const parse = createMosqueSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

  const now = new Date();
  const existing = await SubmissionRate.findOne({ voterKeyHash }).lean();
  if (existing && now.getTime() - existing.lastSubmittedAt.getTime() < 10 * 60 * 1000) {
    return NextResponse.json(
      { error: "Submission rate limited", nextAllowedAt: new Date(existing.lastSubmittedAt.getTime() + 10 * 60 * 1000) },
      { status: 429 },
    );
  }

  const { name, area, address, lat, lng } = parse.data;
  const created = await Mosque.create({
    name,
    district: "Lalmonirhat",
    area,
    address,
    status: "ACTIVE",
    isVerified: false,
    location: { type: "Point", coordinates: [lng, lat] },
  });

  await SubmissionRate.findOneAndUpdate(
    { voterKeyHash },
    { $set: { lastSubmittedAt: now } },
    { upsert: true, new: true },
  );

  return NextResponse.json({ item: created }, { status: 201 });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

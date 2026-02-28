"use client";

import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";
import { areas } from "@/i18n/dict";

const DynamicMapPicker = dynamic(() => import("@/components/MapPicker").then((m) => m.MapPicker), { ssr: false });

export default function AddPage() {
  const [lat, setLat] = useState(25.9);
  const [lng, setLng] = useState(89.4);
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      area: String(form.get("area")),
      address: String(form.get("address") || ""),
      notes: String(form.get("notes") || ""),
      lat,
      lng,
    };
    const res = await fetch("/api/mosques", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMessage(res.ok ? "Mosque added successfully." : data.error ?? "Failed.");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Add Mosque</h1>
      <form className="space-y-3 rounded-2xl border bg-white p-4 shadow-soft" onSubmit={onSubmit}>
        <input className="w-full rounded-xl border p-2" name="name" required placeholder="Mosque name" />
        <select className="w-full rounded-xl border p-2" name="area" required defaultValue="">
          <option value="" disabled>Select area</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input className="w-full rounded-xl border p-2" name="address" placeholder="Address (optional)" />
        <textarea className="w-full rounded-xl border p-2" name="notes" placeholder="Notes (optional)" />
        <p className="text-sm text-slate-600">Lat: {lat.toFixed(6)} · Lng: {lng.toFixed(6)}</p>
        <DynamicMapPicker lat={lat} lng={lng} onPick={(nextLat, nextLng) => { setLat(nextLat); setLng(nextLng); }} />
        <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" type="submit">Submit</button>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </form>
    </div>
  );
}

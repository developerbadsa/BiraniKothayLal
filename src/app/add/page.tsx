"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { areas } from "@/i18n/dict";

const DynamicMapPicker = dynamic(() => import("@/components/MapPicker").then((m) => m.MapPicker), { ssr: false });

type GeoSearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  importance?: number;
};

const MIN_LAT = 25;
const MAX_LAT = 27;
const MIN_LNG = 88;
const MAX_LNG = 90;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildLocationQuery(raw: string, selectedArea: string) {
  const parts = [raw.trim()];
  if (selectedArea) parts.push(selectedArea);
  parts.push("Lalmonirhat", "Bangladesh");
  return parts.filter(Boolean).join(", ");
}

function rankResult(result: GeoSearchResult, selectedArea: string) {
  const text = result.display_name.toLowerCase();
  let score = result.importance ?? 0;
  if (selectedArea && text.includes(selectedArea.toLowerCase())) score += 4;
  if (text.includes("lalmonirhat")) score += 3;
  if (text.includes("bangladesh")) score += 1;
  return score;
}

export default function AddPage() {
  const [lat, setLat] = useState(25.9);
  const [lng, setLng] = useState(89.4);
  const [message, setMessage] = useState("");
  const [locationTouched, setLocationTouched] = useState(false);
  const [selectedArea, setSelectedArea] = useState("");

  const [locationQuery, setLocationQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoStatus, setGeoStatus] = useState("");
  const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);

  useEffect(() => {
    const trimmed = locationQuery.trim();
    if (trimmed.length < 3) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const q = buildLocationQuery(trimmed, selectedArea);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=bd&limit=6&dedupe=1&bounded=1&viewbox=${MIN_LNG},${MAX_LAT},${MAX_LNG},${MIN_LAT}&q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          setSearchResults([]);
          return;
        }
        const data = (await res.json()) as GeoSearchResult[];
        const ranked = [...data].sort((a, b) => rankResult(b, selectedArea) - rankResult(a, selectedArea));
        setSearchResults(ranked);
        if (ranked[0]) {
          setLat(clamp(Number(ranked[0].lat), MIN_LAT, MAX_LAT));
          setLng(clamp(Number(ranked[0].lon), MIN_LNG, MAX_LNG));
          setGeoStatus("নিকটতম ম্যাচ ম্যাপে দেখানো হইছে। ঠিক থাকলে লিস্ট থেকে সিলেক্ট করো বা পিন ঠিক করো।");
        }
      } catch {
        if (!controller.signal.aborted) setSearchResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [locationQuery, selectedArea]);

  const pickLocation = (nextLat: number, nextLng: number) => {
    setLat(clamp(nextLat, MIN_LAT, MAX_LAT));
    setLng(clamp(nextLng, MIN_LNG, MAX_LNG));
    setLocationTouched(true);
  };

  const onUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("এই ব্রাউজারে লোকেশন ধরা যায় না।");
      return;
    }

    setGeoStatus("লোকেশন পারমিশন চাইতেছি...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        pickLocation(position.coords.latitude, position.coords.longitude);
        setGeoAccuracy(position.coords.accuracy ?? null);
        setGeoStatus("তোমার বর্তমান লোকেশন ধরা গেছে। চাইলে পিন টেনে ঠিক করি নাও।");
      },
      (error) => {
        if (error.code === 1) {
          setGeoStatus("লোকেশন পারমিশন বন্ধ আছে। পারমিশন দিয়া আবার দাও।");
          return;
        }
        setGeoStatus("লোকেশন ধরা গেল না, আবার চেষ্টা দাও।");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const coordinateText = useMemo(() => `অক্ষাংশ: ${lat.toFixed(6)} | দ্রাঘিমাংশ: ${lng.toFixed(6)}`, [lat, lng]);
  const canSubmit = locationTouched;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!locationTouched) {
      setMessage("আগে ম্যাপে সঠিক লোকেশন ঠিক করো।");
      return;
    }

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      area: String(form.get("area")),
      address: String(form.get("address") || "").trim(),
      lat,
      lng,
    };

    const res = await fetch("/api/mosques", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMessage(res.ok ? "মসজিদের লোকেশন যোগ হইছে।" : data.error ?? "কাজটা হয় নাই।");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">লোকেশন যোগ দেও</h1>
      <form className="space-y-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-soft" onSubmit={onSubmit}>
        <input className="w-full rounded-xl border border-zinc-200 p-2" name="name" required minLength={3} maxLength={80} placeholder="মসজিদের নাম" />
        <select className="w-full rounded-xl border border-zinc-200 p-2" name="area" required value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
          <option value="" disabled>
            এলাকা জানান
          </option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input className="w-full rounded-xl border border-zinc-200 p-2" name="address" maxLength={140} placeholder="ঠিকানা (চাইলে)" />

        <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-3">
          <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="location-search">
            নাম/বাজার/রোড লিখো, তারপর সঠিক পিনে সেট করো
          </label>
          <input
            id="location-search"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full rounded-xl border border-orange-200 bg-white p-2"
            placeholder="এলাকা/বাজার/রোড লিখো"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onUseCurrentLocation}
              className="rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
            >
              আমার বর্তমান লোকেশন ব্যবহার করো
            </button>
            {searching && <p className="text-sm text-zinc-500">খুঁজতেছি...</p>}
          </div>
          {geoStatus && <p className="mt-2 text-sm text-zinc-600">{geoStatus}</p>}
          {geoAccuracy !== null && (
            <p className="mt-1 text-xs text-zinc-500">
              জিপিএস এক্যুরেসি: প্রায় {Math.round(geoAccuracy)} মিটার {geoAccuracy > 100 ? "(পিন ম্যানুয়ালি ঠিক করা ভালো)" : ""}
            </p>
          )}
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-44 space-y-1 overflow-auto rounded-xl border border-orange-100 bg-white p-2">
              {searchResults.map((r) => (
                <button
                  type="button"
                  key={r.place_id}
                  onClick={() => {
                    pickLocation(Number(r.lat), Number(r.lon));
                    setLocationQuery(r.display_name);
                    setSearchResults([]);
                    setGeoStatus("লোকেশন সিলেক্ট করা হয়েছে। চাইলে পিন টেনে আরো ঠিক করো।");
                  }}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-zinc-700 hover:bg-orange-50"
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-zinc-600">{coordinateText}</p>
        <p className="text-xs text-zinc-500">টিপস: ম্যাপে ক্লিক বা পিন টেনে মসজিদের গেইটের কাছে পিন বসাও।</p>

        <DynamicMapPicker
          lat={lat}
          lng={lng}
          onPick={(nextLat, nextLng) => {
            pickLocation(nextLat, nextLng);
          }}
        />

        <button className="rounded-xl bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!canSubmit}>
          সাবমিট দাও
        </button>
        {!locationTouched && <p className="text-xs text-orange-700">সাবমিটের আগে ম্যাপে লোকেশন একবার ঠিক করে নাও।</p>}
        {message && <p className="text-sm text-zinc-600">{message}</p>}
      </form>
    </div>
  );
}

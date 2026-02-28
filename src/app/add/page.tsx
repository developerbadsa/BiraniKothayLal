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
};

const MIN_LAT = 25;
const MAX_LAT = 27;
const MIN_LNG = 88;
const MAX_LNG = 90;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function AddPage() {
  const [lat, setLat] = useState(25.9);
  const [lng, setLng] = useState(89.4);
  const [message, setMessage] = useState("");

  const [locationQuery, setLocationQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoStatus, setGeoStatus] = useState("");

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
        const q = `${trimmed}, Lalmonirhat, Bangladesh`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=bd&limit=5&q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          setSearchResults([]);
          return;
        }
        const data = (await res.json()) as GeoSearchResult[];
        setSearchResults(data);
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
  }, [locationQuery]);

  const pickLocation = (nextLat: number, nextLng: number) => {
    setLat(clamp(nextLat, MIN_LAT, MAX_LAT));
    setLng(clamp(nextLng, MIN_LNG, MAX_LNG));
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
        setGeoStatus("তোমার বর্তমান লোকেশন ধরা গেছে। চাইলে পিন টেনে ঠিক কইরা নাও।");
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
    setMessage(res.ok ? "মসজিদের লোকেশন যোগ হইছে।" : data.error ?? "কাজটা হয় নাই।");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">লোকেশন যোগ দাও</h1>
      <form className="space-y-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-soft" onSubmit={onSubmit}>
        <input className="w-full rounded-xl border border-zinc-200 p-2" name="name" required placeholder="মসজিদের নাম" />
        <select className="w-full rounded-xl border border-zinc-200 p-2" name="area" required defaultValue="">
          <option value="" disabled>
            এলাকা বাছো
          </option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input className="w-full rounded-xl border border-zinc-200 p-2" name="address" placeholder="ঠিকানা (চাইলে)" />
        <textarea className="w-full rounded-xl border border-zinc-200 p-2" name="notes" placeholder="নোট (চাইলে)" />

        <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-3">
          <label className="mb-1 block text-sm font-medium text-zinc-700" htmlFor="location-search">
            নাম/বাজার/রোড লিখো, ম্যাপ অটো আপডেট হবে
          </label>
          <input
            id="location-search"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full rounded-xl border border-orange-200 bg-white p-2"
            placeholder="এলাকার নাম লিখো"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onUseCurrentLocation}
              className="rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
            >
              আমার বর্তমান লোকেশন ধরো
            </button>
            {searching && <p className="text-sm text-zinc-500">খুঁজতেছি...</p>}
          </div>
          {geoStatus && <p className="mt-2 text-sm text-zinc-600">{geoStatus}</p>}
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
                  }}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-zinc-700 hover:bg-orange-50"
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-zinc-700">
            অক্ষাংশ
            <input
              type="number"
              step="0.000001"
              min={MIN_LAT}
              max={MAX_LAT}
              value={lat}
              onChange={(e) => pickLocation(Number(e.target.value), lng)}
              className="mt-1 w-full rounded-xl border border-zinc-200 p-2"
            />
          </label>
          <label className="text-sm text-zinc-700">
            দ্রাঘিমাংশ
            <input
              type="number"
              step="0.000001"
              min={MIN_LNG}
              max={MAX_LNG}
              value={lng}
              onChange={(e) => pickLocation(lat, Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-zinc-200 p-2"
            />
          </label>
        </div>

        <p className="text-sm text-zinc-600">{coordinateText}</p>
        <p className="text-xs text-zinc-500">টিপস: ম্যাপে ক্লিক কইরা বা পিন টানিয়া ঠিক জায়গা বসাও।</p>

        <DynamicMapPicker
          lat={lat}
          lng={lng}
          onPick={(nextLat, nextLng) => {
            pickLocation(nextLat, nextLng);
          }}
        />

        <button className="rounded-xl bg-orange-600 px-4 py-2 text-white hover:bg-orange-700" type="submit">
          সাবমিট দাও
        </button>
        {message && <p className="text-sm text-zinc-600">{message}</p>}
      </form>
    </div>
  );
}

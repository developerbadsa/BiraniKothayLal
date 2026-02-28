"use client";

import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, Rectangle, TileLayer, useMap } from "react-leaflet";
import Link from "next/link";
import { divIcon } from "leaflet";
import type { MosqueItem } from "@/types/mosque";

const BANGLADESH_BOUNDS: [[number, number], [number, number]] = [
  [20.7, 88.0],
  [26.9, 92.8],
];

const biraniMarkerIcon = divIcon({
  html: '<span style="display:inline-flex;height:38px;width:38px;align-items:center;justify-content:center;border-radius:9999px;background:#ffffff;border:3px solid #f97316;box-shadow:0 8px 18px rgba(249,115,22,0.35);font-size:18px;">&#x1F35B;</span>',
  className: "",
  iconAnchor: [19, 19],
  popupAnchor: [0, -16],
});

function isInBangladesh(lat: number, lng: number) {
  return lat >= BANGLADESH_BOUNDS[0][0] && lat <= BANGLADESH_BOUNDS[1][0] && lng >= BANGLADESH_BOUNDS[0][1] && lng <= BANGLADESH_BOUNDS[1][1];
}

function AutoZoomToHotspot({ mosques }: { mosques: MosqueItem[] }) {
  const map = useMap();

  const hotspot = useMemo(() => {
    if (mosques.length === 0) return [];

    const areaScore = new Map<string, number>();
    for (const m of mosques) {
      const current = areaScore.get(m.area) ?? 0;
      areaScore.set(m.area, current + (m.aggregates?.yesCount ?? 0));
    }

    let topArea = mosques[0].area;
    let topScore = areaScore.get(topArea) ?? 0;

    for (const [area, score] of areaScore) {
      if (score > topScore) {
        topArea = area;
        topScore = score;
      }
    }

    return mosques.filter((m) => m.area === topArea);
  }, [mosques]);

  useEffect(() => {
    if (hotspot.length === 0) {
      map.flyTo([23.85, 90.35], 7, { duration: 1.2, easeLinearity: 0.25 });
      return;
    }

    if (hotspot.length === 1) {
      const one = hotspot[0];
      map.flyTo([one.location.coordinates[1], one.location.coordinates[0]], 14, { duration: 1.2, easeLinearity: 0.25 });
      return;
    }

    const bounds = hotspot.map((m) => [m.location.coordinates[1], m.location.coordinates[0]] as [number, number]);
    map.flyToBounds(bounds, { padding: [48, 48], maxZoom: 15, duration: 1.2, easeLinearity: 0.25 });
  }, [hotspot, map]);

  return null;
}

export function MapView({ mosques }: { mosques: MosqueItem[] }) {
  const bdMosques = useMemo(
    () =>
      mosques.filter((m) => {
        const lat = m.location.coordinates[1];
        const lng = m.location.coordinates[0];
        return isInBangladesh(lat, lng);
      }),
    [mosques],
  );

  return (
    <div className="h-[420px] overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-soft">
      <MapContainer
        center={[23.85, 90.35]}
        zoom={7}
        minZoom={7}
        maxZoom={18}
        maxBounds={BANGLADESH_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        zoomAnimation
      >
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Rectangle bounds={BANGLADESH_BOUNDS} pathOptions={{ color: "#f97316", weight: 2, fillColor: "#fdba74", fillOpacity: 0.08 }} />
        <AutoZoomToHotspot mosques={bdMosques} />
        {bdMosques.map((m) => (
          <Marker key={m._id} position={[m.location.coordinates[1], m.location.coordinates[0]]} icon={biraniMarkerIcon}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{m.name}</p>
                <p className="text-xs">{m.area}</p>
                <Link href={`/mosque/${m._id}`} className="text-sm text-orange-700 underline">
                  {"\u09ac\u09bf\u09b8\u09cd\u09a4\u09be\u09b0\u09bf\u09a4\u0020\u0986\u09b0\u0020\u09ad\u09cb\u099f"}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

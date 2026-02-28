"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Link from "next/link";
import { divIcon } from "leaflet";
import type { MosqueItem } from "@/types/mosque";

const biraniMarkerIcon = divIcon({
  html: '<span style="display:inline-flex;height:34px;width:34px;align-items:center;justify-content:center;border-radius:9999px;background:#ffffff;border:2px solid #14b8a6;box-shadow:0 6px 14px rgba(20,184,166,0.35);font-size:18px;">🍛</span>',
  className: "",
  iconAnchor: [17, 17],
  popupAnchor: [0, -16],
});

export function MapView({ mosques }: { mosques: MosqueItem[] }) {
  return (
    <div className="h-[420px] overflow-hidden rounded-2xl border bg-white shadow-soft">
      <MapContainer center={[25.917, 89.45]} zoom={10} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {mosques.map((m) => (
          <Marker key={m._id} position={[m.location.coordinates[1], m.location.coordinates[0]]} icon={biraniMarkerIcon}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{m.name}</p>
                <p className="text-xs">{m.area}</p>
                <Link href={`/mosque/${m._id}`} className="text-sm text-blue-700 underline">
                  Details & vote
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

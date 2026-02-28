"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Link from "next/link";

export function MapView({ mosques }: { mosques: any[] }) {
  return (
    <div className="h-[420px] overflow-hidden rounded-2xl border bg-white shadow-soft">
      <MapContainer center={[25.917, 89.45]} zoom={10} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {mosques.map((m) => (
          <Marker key={m._id} position={[m.location.coordinates[1], m.location.coordinates[0]]}>
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

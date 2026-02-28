"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LeafletEventHandlerFnMap } from "leaflet";

function Clicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnPosition({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

export function MapPicker({ lat, lng, onPick }: { lat: number; lng: number; onPick: (lat: number, lng: number) => void }) {
  const position = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);
  const dragHandlers = useMemo<LeafletEventHandlerFnMap>(
    () => ({
      dragend(e) {
        const marker = e.target;
        const next = marker.getLatLng();
        onPick(next.lat, next.lng);
      },
    }),
    [onPick],
  );

  return (
    <div className="h-64 overflow-hidden rounded-xl border">
      <MapContainer center={position} zoom={11} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} draggable eventHandlers={dragHandlers} />
        <Clicker onPick={onPick} />
        <RecenterOnPosition lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const FALLBACK_CENTER = [12.9716, 77.5946]; // Bangalore, IN

export default function ProfessionalsMap({ professionals }) {
  const located = useMemo(
    () => professionals.filter((p) => p.latitude != null && p.longitude != null),
    [professionals]
  );

  const center = located.length > 0 ? [located[0].latitude, located[0].longitude] : FALLBACK_CENTER;

  return (
    <div className="h-96 w-full overflow-hidden rounded-2xl border border-outline-variant">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {located.map((worker) => (
          <Marker key={worker.id} position={[worker.latitude, worker.longitude]} icon={markerIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{worker.name}</p>
                <p>{worker.title}</p>
                <p>${worker.hourlyRate}/hr &middot; {worker.rating}★</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

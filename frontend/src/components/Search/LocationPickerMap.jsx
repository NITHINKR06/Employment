"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
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

/** Read-only single-marker map — visual confirmation that a geocoded address landed in the right place. */
export default function LocationPickerMap({ latitude, longitude }) {
  const position = [latitude, longitude];
  return (
    <div className="h-56 w-full overflow-hidden rounded-lg border border-outline-variant">
      {/* react-leaflet only applies `center`/`zoom` on MapContainer's first
          mount — it won't re-pan an already-mounted map when they change on a
          later render. Keying on the coordinates forces a full remount (and
          therefore a re-center) every time a new address is located. */}
      <MapContainer
        key={`${latitude},${longitude}`}
        center={position}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}

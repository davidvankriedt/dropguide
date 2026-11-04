'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { LeafletMouseEvent, LatLngExpression } from 'leaflet';
import { DropLocation } from '@/lib/supabase';

// Fix Leaflet's missing marker icon path issue in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapInnerProps {
  locations: DropLocation[];
  onSelectCoords: (lat: number, lng: number) => void;
  selectedCoord: { lat: number; lng: number } | null;
}

export default function MapInner({ locations, onSelectCoords, selectedCoord }: MapInnerProps) {
  // Default centered roughly on Sydney
  const defaultCenter: [number, number] = [-33.8688, 151.2093];

  return (
    <MapContainer
      {...{ center: defaultCenter }}
      zoom={12}
      className="w-full h-full z-0"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <LocationPicker onSelect={onSelectCoords} />

      {/* Render all saved dock pins */}
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={defaultIcon}>
          <Popup>
            <div className="p-1 space-y-1.5 max-w-[220px] text-slate-900">
              <h3 className="font-bold text-sm leading-tight text-slate-900">{loc.venue_name}</h3>
              {loc.address && <p className="text-xs text-slate-600">{loc.address}</p>}
              {loc.access_code && (
                <div className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded font-mono font-semibold">
                  Gate/Pin: {loc.access_code}
                </div>
              )}
              {loc.dock_instructions && (
                <p className="text-xs bg-slate-100 p-1.5 rounded text-slate-800">
                  {loc.dock_instructions}
                </p>
              )}
              {loc.image_url && (
                <img
                  src={loc.image_url}
                  alt={loc.venue_name}
                  className="rounded h-28 w-full object-cover border border-slate-200"
                />
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Temporary pin when driver taps map to add location */}
      {selectedCoord && (
        <Marker position={[selectedCoord.lat, selectedCoord.lng]} icon={defaultIcon}>
          <Popup>New drop point selected</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Custom SVG divIcon to avoid missing Leaflet png assets
const pinIcon = L.divIcon({
  className: 'custom-leaflet-pin',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(65, 105, 225, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 20px; height: 20px; border-radius: 50%; background: #4169E1; border: 3px solid #FFFFFF; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF;"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function ReportLocationMap({ latitude, longitude, onLocationChange }) {
  const lat = Number(latitude) || 40.7306;
  const lng = Number(longitude) || -73.9867;

  const handleSelect = (newLat, newLng) => {
    onLocationChange(newLat.toFixed(5), newLng.toFixed(5));
  };

  return (
    <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-slate-200/90 shadow-inner">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={pinIcon} />
        <MapClickHandler onLocationSelect={handleSelect} />
        <MapRecenter lat={lat} lng={lng} />
      </MapContainer>

      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-200 text-[10px] font-medium text-slate-600 shadow-sm pointer-events-none">
        Click map to reposition pin
      </div>
    </div>
  );
}

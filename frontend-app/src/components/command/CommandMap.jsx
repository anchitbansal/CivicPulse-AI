import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import SeverityBadge from '../common/SeverityBadge';
import PriorityIndicator from '../common/PriorityIndicator';
import { MapPin, Navigation } from 'lucide-react';

// Create custom pin icons for each severity
function createSeverityIcon(severity) {
  const norm = String(severity || 'LOW').toUpperCase();
  const colors = {
    CRITICAL: { bg: '#EF4444', ring: 'rgba(239, 68, 68, 0.3)' },
    MEDIUM: { bg: '#F59E0B', ring: 'rgba(245, 158, 11, 0.3)' },
    LOW: { bg: '#3B82F6', ring: 'rgba(59, 130, 246, 0.3)' },
    RESOLVED: { bg: '#10B981', ring: 'rgba(16, 185, 129, 0.3)' },
  }[norm] || { bg: '#64748B', ring: 'rgba(100, 116, 139, 0.3)' };

  return L.divIcon({
    className: 'custom-incident-pin',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: ${colors.ring}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 18px; height: 18px; border-radius: 50%; background: ${colors.bg}; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
          <div style="width: 5px; height: 5px; border-radius: 50%; background: #FFFFFF;"></div>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function MapCenterOnTickets({ tickets }) {
  const map = useMap();
  useEffect(() => {
    const validCoords = tickets
      .map((t) => t.location?.coordinates)
      .filter((c) => Array.isArray(c) && c.length === 2 && !isNaN(c[0]) && !isNaN(c[1]));

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords.map(([lng, lat]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [tickets, map]);
  return null;
}

export default function CommandMap({ tickets = [], onSelectTicket, className = '' }) {
  const validTickets = tickets.filter(
    (t) =>
      t.location?.coordinates &&
      Array.isArray(t.location.coordinates) &&
      t.location.coordinates.length === 2 &&
      !isNaN(t.location.coordinates[0]) &&
      !isNaN(t.location.coordinates[1])
  );

  const defaultCenter = validTickets.length > 0
    ? [validTickets[0].location.coordinates[1], validTickets[0].location.coordinates[0]]
    : [40.7306, -73.9867];

  return (
    <div className={`relative w-full h-full min-h-[380px] rounded-xl overflow-hidden border border-navy-750 bg-navy-950 shadow-inner ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validTickets.map((ticket) => {
          const [lng, lat] = ticket.location.coordinates;
          const icon = createSeverityIcon(ticket.status === 'Resolved' ? 'RESOLVED' : ticket.severity);

          return (
            <Marker key={ticket._id} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className="p-1 space-y-2 min-w-[190px]">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">
                      #{ticket._id?.slice(-6) || 'INCIDENT'}
                    </span>
                    <SeverityBadge severity={ticket.status === 'Resolved' ? 'RESOLVED' : ticket.severity} size="sm" />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white capitalize">{(ticket.defect_type || 'Civic Issue').replace(/_/g, ' ')}</h4>
                    <p className="text-[11px] text-slate-300">
                      Zone: <span className="capitalize">{ticket.zone || 'central'}</span> • Status: <strong className="text-white">{ticket.status}</strong>
                    </p>
                  </div>

                  <PriorityIndicator score={ticket.priority_score || 0} size="sm" />

                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Reports: {ticket.report_frequency || 1}</span>
                    <button
                      type="button"
                      onClick={() => onSelectTicket && onSelectTicket(ticket)}
                      className="text-cyan-400 font-bold hover:underline"
                    >
                      Inspect →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapCenterOnTickets tickets={validTickets} />
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-navy-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-[11px] text-slate-300 shadow-elevation flex items-center gap-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Resolved</span>
        </div>
      </div>

      {validTickets.length === 0 && (
        <div className="absolute inset-0 z-[400] bg-navy-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <MapPin className="w-8 h-8 text-slate-500 mb-2" />
          <p className="text-sm font-semibold text-white">No Geo-Located Tickets Found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Incoming reports with GPS coordinates will appear dynamically on this operational map.
          </p>
        </div>
      )}
    </div>
  );
}

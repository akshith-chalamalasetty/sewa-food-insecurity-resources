import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

// Fix default marker icon paths (Leaflet bundles assume webpack paths)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom green icon for pantries
const pantryIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
      <path d="M18 0C8 0 0 8 0 18c0 13 18 30 18 30s18-17 18-30C36 8 28 0 18 0z" fill="#2f7d32" stroke="#1f5a23" stroke-width="2"/>
      <text x="18" y="24" text-anchor="middle" font-size="18" fill="white">🥕</text>
    </svg>`),
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -42],
});

const userIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="10" fill="#d97706" stroke="white" stroke-width="3"/>
      <circle cx="14" cy="14" r="4" fill="white"/>
    </svg>`),
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FitToBounds({ pantries, userLoc }) {
  const map = useMap();
  useEffect(() => {
    const points = pantries
      .filter((p) => p.lat && p.lng)
      .map((p) => [p.lat, p.lng]);
    if (userLoc) points.push([userLoc.lat, userLoc.lng]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [pantries, userLoc, map]);
  return null;
}

// LA County center as fallback
const DEFAULT_CENTER = [34.0522, -118.2437];

export default function PantryMap({ pantries, userLoc, onPantryClick }) {
  const withCoords = pantries.filter((p) => p.lat && p.lng);
  return (
    <div className="map-wrap">
      <MapContainer
        center={userLoc ? [userLoc.lat, userLoc.lng] : DEFAULT_CENTER}
        zoom={11}
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLoc && (
          <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {withCoords.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={pantryIcon}
            eventHandlers={{
              click: () => onPantryClick && onPantryClick(p),
            }}
          >
            <Popup>
              <strong>{p.name}</strong><br />
              {p.address}, {p.city} {p.zip_code}<br />
              {p.hours && <><em>{p.hours}</em><br /></>}
              {p.phone && <a href={`tel:${p.phone}`}>{p.phone}</a>}
            </Popup>
          </Marker>
        ))}
        <FitToBounds pantries={withCoords} userLoc={userLoc} />
      </MapContainer>
      {withCoords.length < pantries.length && (
        <p className="muted small">
          {pantries.length - withCoords.length} pantries don't have coordinates yet and only show in list view.
        </p>
      )}
    </div>
  );
}

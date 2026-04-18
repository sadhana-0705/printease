import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* 🔵 Student marker */
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* 🔴 Net centre marker */
const netCentreIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* ✅ Auto-fit bounds component */
function FitBounds({ userLocation, netCentres }) {
  const map = useMap();

  if (!userLocation) return null;

  // Filter out netcentres with undefined coordinates
  const validNetCentres = netCentres.filter(nc => nc.lat !== undefined && nc.lng !== undefined);
  
  const allPoints = [
    [userLocation.lat, userLocation.lng],
    ...validNetCentres.map((nc) => [nc.lat, nc.lng]),
  ];
  
  // Only fit bounds if there are valid points
  if (allPoints.length > 0) {
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  return null;
}

export default function NetCentreMap({ userLocation, netCentres }) {
  if (!userLocation) return null;

  return (
    <MapContainer
      className="h-64 w-full rounded"
      zoom={13}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* Auto-fit map */}
      <FitBounds
        userLocation={userLocation}
        netCentres={netCentres}
      />

      {/* 🔵 Student location */}
      <Marker
        position={[userLocation.lat, userLocation.lng]}
        icon={userIcon}
      >
        <Tooltip permanent direction="top" offset={[0, -20]}>
          <span className="font-semibold text-blue-600">
            You are here
          </span>
        </Tooltip>
      </Marker>

      {/* 🔴 Net centres */}
      {netCentres.map((nc) => {
        // Skip markers with undefined coordinates
        if (nc.lat === undefined || nc.lng === undefined) {
          return null;
        }
        return (
          <Marker
            key={nc._id || nc.id}
            position={[nc.lat, nc.lng]}
            icon={netCentreIcon}
          >
            <Tooltip permanent direction="top" offset={[0, -20]}>
              <span className="font-semibold text-sm">
                {nc.name}
              </span>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

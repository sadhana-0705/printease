import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const netCentreIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const studentIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const deliveryBoyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FitBounds({ points }) {
  const map = useMap();

  if (!points.length) {
    return null;
  }

  const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]));
  map.fitBounds(bounds, { padding: [40, 40] });

  return null;
}

function hasValidLocation(location) {
  return location && location.lat != null && location.lng != null;
}

export default function OrderTrackingMap({
  netCentreLocation,
  studentLocation,
  deliveryBoyLocation,
}) {
  if (!hasValidLocation(netCentreLocation) || !hasValidLocation(studentLocation)) {
    return null;
  }

  const markerPoints = [
    netCentreLocation,
    studentLocation,
    ...(hasValidLocation(deliveryBoyLocation) ? [deliveryBoyLocation] : []),
  ];

  return (
    <MapContainer
      className="h-64 w-full rounded-lg"
      zoom={13}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <FitBounds points={markerPoints} />

      <Marker
        position={[netCentreLocation.lat, netCentreLocation.lng]}
        icon={netCentreIcon}
      >
        <Tooltip permanent direction="top" offset={[0, -20]}>
          <span className="font-semibold text-sm">NetCentre</span>
        </Tooltip>
      </Marker>

      <Marker
        position={[studentLocation.lat, studentLocation.lng]}
        icon={studentIcon}
      >
        <Tooltip permanent direction="top" offset={[0, -20]}>
          <span className="font-semibold text-blue-600 text-sm">Student</span>
        </Tooltip>
      </Marker>

      {hasValidLocation(deliveryBoyLocation) && (
        <Marker
          position={[deliveryBoyLocation.lat, deliveryBoyLocation.lng]}
          icon={deliveryBoyIcon}
        >
          <Tooltip permanent direction="top" offset={[0, -20]}>
            <span className="font-semibold text-green-600 text-sm">
              Delivery Agent
            </span>
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}

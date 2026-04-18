import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
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

function hasValidLocation(location) {
  return location && location.lat != null && location.lng != null;
}

async function fetchRouteCoordinates(points, signal) {
  const waypointString = points
    .map((point) => `${point.lng},${point.lat}`)
    .join(";");

  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${waypointString}?overview=full&geometries=geojson`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch route data");
  }

  const data = await response.json();
  const coordinates = data.routes?.[0]?.geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error("Route data is unavailable");
  }

  return coordinates.map(([lng, lat]) => [lat, lng]);
}

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) {
      return undefined;
    }

    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });

    return undefined;
  }, [map, points]);

  return null;
}

export default function DeliveryMap({ netcentreLocation, studentLocation }) {
  const location = useLocation();
  const { orderId } = useParams();
  const order = location.state?.order;
  const resolvedNetCentreLocation = netcentreLocation || order?.netCentreLocation;
  const resolvedStudentLocation = studentLocation || order?.studentLocation;
  const resolvedDeliveryBoyLocation = order?.deliveryBoyLocation;
  const [routePath, setRoutePath] = useState([]);
  const [routeError, setRouteError] = useState("");

  const markerPoints = [
    ...(hasValidLocation(resolvedDeliveryBoyLocation) ? [resolvedDeliveryBoyLocation] : []),
    ...(hasValidLocation(resolvedNetCentreLocation) ? [resolvedNetCentreLocation] : []),
    ...(hasValidLocation(resolvedStudentLocation) ? [resolvedStudentLocation] : []),
  ];

  useEffect(() => {
    if (markerPoints.length < 2) {
      setRoutePath([]);
      setRouteError("");
      return undefined;
    }

    const controller = new AbortController();

    fetchRouteCoordinates(markerPoints, controller.signal)
      .then((coordinates) => {
        setRoutePath(coordinates);
        setRouteError("");
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Failed to load route path:", error);
        setRoutePath(markerPoints.map((point) => [point.lat, point.lng]));
        setRouteError("Showing a direct path because the route service is unavailable.");
      });

    return () => {
      controller.abort();
    };
  }, [
    resolvedDeliveryBoyLocation?.lat,
    resolvedDeliveryBoyLocation?.lng,
    resolvedNetCentreLocation?.lat,
    resolvedNetCentreLocation?.lng,
    resolvedStudentLocation?.lat,
    resolvedStudentLocation?.lng,
  ]);

  if (!hasValidLocation(resolvedNetCentreLocation) || !hasValidLocation(resolvedStudentLocation)) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <Card hoverEffect={false}>
          <h2 className="text-2xl font-bold mb-2">Delivery Map</h2>
          <p className="text-neutral-600">
            Map data is unavailable for order {orderId}.
          </p>
        </Card>
      </div>
    );
  }

  const center = [
    (resolvedNetCentreLocation.lat + resolvedStudentLocation.lat) / 2,
    (resolvedNetCentreLocation.lng + resolvedStudentLocation.lng) / 2,
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1f4e79] mb-2">Delivery Map</h1>
        <p className="text-neutral-600">
          Route view for order {order?._id || orderId}
        </p>
        {routeError && (
          <p className="mt-2 text-sm text-amber-700">{routeError}</p>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="h-96 w-full rounded-xl overflow-hidden"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <FitBounds points={markerPoints} />

        {routePath.length > 0 && (
          <Polyline
            positions={routePath}
            pathOptions={{ color: "#1f4e79", opacity: 0.85, weight: 5 }}
          />
        )}

        <Marker
          position={[resolvedNetCentreLocation.lat, resolvedNetCentreLocation.lng]}
          icon={netCentreIcon}
        >
          <Tooltip permanent direction="top" offset={[0, -20]}>
            <span className="font-semibold text-sm">Net Centre</span>
          </Tooltip>
        </Marker>

        <Marker
          position={[resolvedStudentLocation.lat, resolvedStudentLocation.lng]}
          icon={studentIcon}
        >
          <Tooltip permanent direction="top" offset={[0, -20]}>
            <span className="font-semibold text-blue-600 text-sm">Student</span>
          </Tooltip>
        </Marker>

        {hasValidLocation(resolvedDeliveryBoyLocation) && (
          <Marker
            position={[resolvedDeliveryBoyLocation.lat, resolvedDeliveryBoyLocation.lng]}
            icon={deliveryBoyIcon}
          >
            <Tooltip permanent direction="top" offset={[0, -20]}>
              <span className="font-semibold text-green-600 text-sm">Delivery Boy</span>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { updateMyLocation } from "../../services/authService";
import { calculateOrderTotalFromOrder } from "../../utils/orderPricing";
import {
  claimDelivery,
  clearDeliveredOrder,
  getAvailableDeliveries,
  getMyDeliveries,
  markDelivered,
  markPickedUp,
  rejectDelivery,
  startDelivery
} from "../../services/deliveryService";

const SECTION_CONFIG = [
  {
    key: "available",
    title: "Available Deliveries",
    statuses: ["available"],
  },
  {
    key: "in-progress",
    title: "My Active Deliveries",
    statuses: ["assigned", "picked_up", "out_for_delivery"],
  },
  {
    key: "completed",
    title: "Completed Deliveries",
    statuses: ["delivered"],
  },
];

function formatLocation(location) {
  if (!location || location.lat == null || location.lng == null) {
    return "Location unavailable";
  }

  return `${location.lat}, ${location.lng}`;
}

function formatPickup(order) {
  const netCentreName = order.netCentreId?.name || "Unknown Net Centre";
  const netCentreAddress = order.netCentreId?.address || "Address unavailable";
  return `${netCentreName} - ${netCentreAddress}`;
}

function formatCurrency(value) {
  return `Rs ${value || 0}`;
}

function calculateOrderTotal(order) {
  return calculateOrderTotalFromOrder(order);
}

function getActionConfig(status) {
  if (status === "available") {
    return {
      label: "Accept Delivery",
      action: claimDelivery,
    };
  }

  if (status === "assigned") {
    return {
      label: "Mark Picked Up",
      action: markPickedUp,
    };
  }

  if (status === "picked_up") {
    return {
      label: "Start Delivery",
      action: startDelivery,
    };
  }

  if (status === "out_for_delivery") {
    return {
      label: "Mark Delivered",
      action: markDelivered,
    };
  }

  return null;
}

function getSecondaryActionConfig(status) {
  if (status === "available") {
    return {
      label: "Reject Delivery",
      action: rejectDelivery,
    };
  }

  if (status === "delivered") {
    return {
      label: "Clear Order",
      action: clearDeliveredOrder,
    };
  }

  return null;
}

function DeliveryOrderCard({
  order,
  actionOrderId,
  onOpenDetails,
  onViewMap,
  onUpdateStatus,
}) {
  const primaryAction = getActionConfig(order.status);
  const secondaryAction = getSecondaryActionConfig(order.status);

  return (
    <Card className="w-full">
      <div
        className="cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors"
        onClick={() => onOpenDetails(order)}
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="font-medium">Order #{order._id}</p>
            <p className="text-sm text-gray-600">
              Student: {order.studentId?.name || "Unknown Student"}
            </p>
            <p className="text-sm text-gray-500">
              Pickup: {order.pickupOption} | Payment: {order.paymentMode}
            </p>
            <p className="text-sm text-gray-600">
              Documents: {order.documents?.length || 0} | Total: {formatCurrency(calculateOrderTotal(order))}
            </p>
            {typeof order.distanceKm === "number" && (
              <p className="text-sm text-gray-500">
                Distance from net centre: {order.distanceKm.toFixed(1)} km
              </p>
            )}
          </div>

          <Badge text={order.status} status={order.status} />
        </div>
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        <Button
          variant="secondary"
          onClick={(event) => {
            event.stopPropagation();
            onViewMap(order);
          }}
        >
          View Map
        </Button>

        {primaryAction && (
          <Button
            onClick={(event) => {
              event.stopPropagation();
              onUpdateStatus(order._id, primaryAction.action);
            }}
            disabled={actionOrderId === order._id}
          >
            {actionOrderId === order._id ? "Updating..." : primaryAction.label}
          </Button>
        )}

        {secondaryAction && (
          <Button
            variant="danger"
            onClick={(event) => {
              event.stopPropagation();
              onUpdateStatus(order._id, secondaryAction.action);
            }}
            disabled={actionOrderId === order._id}
          >
            {actionOrderId === order._id ? "Updating..." : secondaryAction.label}
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const { section } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionOrderId, setActionOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const activeSection = useMemo(
    () => SECTION_CONFIG.find((item) => item.key === section) || SECTION_CONFIG[0],
    [section]
  );

  const refreshCurrentLocation = async () => {
    if (!navigator.geolocation) {
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      await updateMyLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (locationError) {
      console.warn("Could not refresh delivery boy location:", locationError);
    }
  };

  const loadOrders = async () => {
    try {
      const data =
        activeSection.key === "available"
          ? await getAvailableDeliveries()
          : await getMyDeliveries();
      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (loadError) {
      setError(
        loadError.response?.data?.message || "Failed to load delivery orders"
      );
    }
  };

  const handleStatusUpdate = async (orderId, updateAction) => {
    try {
      setActionOrderId(orderId);
      const targetOrder = orders.find((order) => order._id === orderId) || selectedOrder;

      if (updateAction === claimDelivery) {
        await updateAction(orderId, targetOrder?.claimVersion);
      } else {
        await updateAction(orderId);
      }

      await loadOrders();
    } catch (updateError) {
      await loadOrders();
      setError(
        updateError.response?.data?.message || "Failed to update delivery status"
      );
    } finally {
      setActionOrderId("");
    }
  };

  const handleViewMap = (order) => {
    navigate(`/delivery-map/${order._id}`, {
      state: { order },
    });
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  useEffect(() => {
    let isMounted = true;

    const initializeOrders = async () => {
      try {
        await refreshCurrentLocation();
        const data =
          activeSection.key === "available"
            ? await getAvailableDeliveries()
            : await getMyDeliveries();
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError.response?.data?.message || "Failed to load delivery orders"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeOrders();

    return () => {
      isMounted = false;
    };
  }, [activeSection.key]);

  return (
    <div className="space-y-4 min-h-[70vh]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{activeSection.title}</h1>
          <p className="text-gray-600 mt-1">
            {activeSection.title === "Available Deliveries" && "Nearby orders that are ready to be claimed for delivery."}
            {activeSection.title === "My Active Deliveries" && "Orders you have accepted and are currently handling."}
            {activeSection.title === "Completed Deliveries" && "Orders that have already been delivered."}
          </p>
        </div>
        <Link
          to="/delivery-dashboard"
          className="inline-flex items-center text-[#4a90e2] font-medium hover:text-[#357abd] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {loading && (
        <Card hoverEffect={false}>
          <p>Loading deliveries...</p>
        </Card>
      )}

      {error && (
        <Card hoverEffect={false}>
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {!loading && !error && (
        (() => {
          const filteredOrders = orders.filter((order) =>
            activeSection.statuses.includes(order.status)
          );

          return filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <DeliveryOrderCard
                  key={order._id}
                  order={order}
                  actionOrderId={actionOrderId}
                  onOpenDetails={handleOpenDetails}
                  onViewMap={handleViewMap}
                  onUpdateStatus={handleStatusUpdate}
                />
              ))}
            </div>
          ) : (
            <Card hoverEffect={false}>
              <p className="text-neutral-500">No orders in this section yet.</p>
            </Card>
          );
        })()
      )}

      <Modal open={showOrderDetails} onClose={handleCloseDetails}>
        {selectedOrder && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Delivery Order Details</h2>
                <p className="text-sm text-gray-500">
                  Order #{selectedOrder._id}
                </p>
              </div>
              <Badge text={selectedOrder.status} status={selectedOrder.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Student:</span> {selectedOrder.studentId?.name || "Unknown"}</div>
              <div><span className="font-medium">Payment:</span> {selectedOrder.paymentMode}</div>
              <div><span className="font-medium">Pickup:</span> {selectedOrder.pickupOption}</div>
              <div><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
            </div>

            {typeof selectedOrder.distanceKm === "number" && (
              <div className="text-sm text-gray-500">
                Delivery distance from net centre: {selectedOrder.distanceKm.toFixed(1)} km
              </div>
            )}

            <div className="border-t pt-4 text-sm space-y-2">
              <h3 className="font-medium">Pickup Details</h3>
              <div>{formatPickup(selectedOrder)}</div>
              <div className="text-gray-500">
                Coordinates: {formatLocation(selectedOrder.netCentreLocation)}
              </div>
            </div>

            <div className="border-t pt-4 text-sm space-y-2">
              <h3 className="font-medium">Drop Details</h3>
              <div>{selectedOrder.studentId?.name || "Student location"}</div>
              <div className="text-gray-500">
                Coordinates: {formatLocation(selectedOrder.studentLocation)}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Document Details:</h3>
              {selectedOrder.documents?.map((doc, index) => (
                <div key={index} className="text-sm border-b pb-2 mb-2 last:border-b-0 last:mb-0">
                  <div><span className="font-medium">File:</span> {doc.fileUrl?.split("/").pop() || "N/A"}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-medium">Type:</span> {doc.fileType || "N/A"}</div>
                    <div><span className="font-medium">Pages:</span> {doc.pages || "N/A"}</div>
                    <div><span className="font-medium">Copies:</span> {doc.copies || "N/A"}</div>
                    <div><span className="font-medium">Color:</span> {doc.color ? "Color" : "Black & White"}</div>
                    <div><span className="font-medium">Sides:</span> {doc.sides || "N/A"}</div>
                    <div><span className="font-medium">Cost per page:</span> {formatCurrency(doc.costPerPage)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold text-sm">
                <span>Total:</span>
                <span>{formatCurrency(calculateOrderTotal(selectedOrder))}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3 flex-wrap">
              <Button
                variant="secondary"
                onClick={() => handleViewMap(selectedOrder)}
              >
                View Map
              </Button>

              {getActionConfig(selectedOrder.status) && (
                <Button
                  onClick={() => handleStatusUpdate(selectedOrder._id, getActionConfig(selectedOrder.status).action)}
                  disabled={actionOrderId === selectedOrder._id}
                >
                  {actionOrderId === selectedOrder._id
                    ? "Updating..."
                    : getActionConfig(selectedOrder.status).label}
                </Button>
              )}

              {getSecondaryActionConfig(selectedOrder.status) && (
                <Button
                  variant="danger"
                  onClick={() => handleStatusUpdate(selectedOrder._id, getSecondaryActionConfig(selectedOrder.status).action)}
                  disabled={actionOrderId === selectedOrder._id}
                >
                  {actionOrderId === selectedOrder._id
                    ? "Updating..."
                    : getSecondaryActionConfig(selectedOrder.status).label}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { getMyOrders } from "../../services/orderService";
import { useNotification } from "../../hooks/useNotification";
import OrderTrackingMap from "../../components/map/OrderTrackingMap";
import { calculateOrderTotalFromOrder } from "../../utils/orderPricing";

const DELIVERY_STATUSES = [
  "pending",
  "accepted",
  "printing",
  "available",
  "assigned",
  "picked_up",
  "out_for_delivery",
  "delivered",
];

const PICKUP_STATUSES = ["pending", "accepted", "printing", "ready", "completed"];

function formatStatusLabel(status) {
  if (status === "picked_up") {
    return "Picked Up";
  }

  if (status === "out_for_delivery") {
    return "Out for Delivery";
  }

  if (status === "available") {
    return "Waiting for Delivery";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getTimeline(statuses, currentStatus) {
  if (currentStatus === "rejected") {
    return [
      { status: "pending", completed: true, current: false },
      { status: "rejected", completed: true, current: true },
    ];
  }

  const currentIndex = statuses.indexOf(currentStatus);

  return statuses.map((status, index) => ({
    status,
    completed: currentIndex >= 0 && index <= currentIndex,
    current: index === currentIndex,
  }));
}

function getPickupStatusMessage(status) {
  switch (status) {
    case "pending":
      return {
        title: "Order Placed",
        body: "Your order has been submitted and is waiting for the net centre to accept it.",
        className: "bg-slate-50 border-slate-200 text-slate-700",
      };
    case "accepted":
      return {
        title: "Accepted by Net Centre",
        body: "The net centre has accepted your order and will start preparing it.",
        className: "bg-blue-50 border-blue-200 text-blue-700",
      };
    case "printing":
      return {
        title: "Printing in Progress",
        body: "Your documents are currently being printed.",
        className: "bg-amber-50 border-amber-200 text-amber-700",
      };
    case "ready":
      return {
        title: "Ready for Pickup",
        body: "Your order is ready and can be collected from the net centre.",
        className: "bg-green-50 border-green-200 text-green-700",
      };
    case "completed":
      return {
        title: "Picked Up",
        body: "This pickup order has been completed.",
        className: "bg-emerald-50 border-emerald-200 text-emerald-700",
      };
    case "rejected":
      return {
        title: "Order Rejected",
        body: "The net centre rejected this order.",
        className: "bg-red-50 border-red-200 text-red-700",
      };
    default:
      return {
        title: formatStatusLabel(status),
        body: "Order status updated.",
        className: "bg-slate-50 border-slate-200 text-slate-700",
      };
  }
}

export default function OrderStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { showNotification } = useNotification();

  // Fetch orders when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getMyOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        showNotification("Failed to fetch orders", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [showNotification]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Order Status Tracker</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDeliveryOrder = order.deliveryType === "delivery";
            const timeline = getTimeline(
              isDeliveryOrder ? DELIVERY_STATUSES : PICKUP_STATUSES,
              order.status
            );
            const pickupStatusMessage = getPickupStatusMessage(order.status);
            
            return (
              <Card key={order._id || order.id}>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order._id || order.id.substring(0, 8)}</h3>
                      <p className="text-sm text-gray-600">Net Centre: {order.netCentreId?.name || 'Unknown'}</p>
                      <p className="text-sm">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge text={order.status} status={order.status} />
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Progress:</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 overflow-x-auto">
                        {timeline.map((item, index) => (
                          <div key={`${item.status}-${index}`} className="flex flex-col items-center flex-1 min-w-[72px]">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              item.completed 
                                ? 'bg-green-500 text-white' 
                                : item.current 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-200'
                            }`}>
                              {index + 1}
                            </div>
                            <span className={`text-xs mt-1 text-center ${
                              item.current ? 'font-semibold text-blue-600' : ''
                            }`}>
                              {formatStatusLabel(item.status)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {isDeliveryOrder ? (
                        <>
                          {order.status === "available" && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                              <p className="font-semibold text-blue-700">Waiting for a delivery boy</p>
                              <p className="text-sm mt-1 text-blue-700">
                                Your order is ready at the net centre and can now be claimed by the nearest delivery boy.
                              </p>
                            </div>
                          )}

                          <OrderTrackingMap
                            netCentreLocation={order.netCentreLocation}
                            studentLocation={order.studentLocation}
                            deliveryBoyLocation={order.deliveryBoyLocation}
                          />
                        </>
                      ) : (
                        <div className={`rounded-lg border px-4 py-3 ${pickupStatusMessage.className}`}>
                          <p className="font-semibold">{pickupStatusMessage.title}</p>
                          <p className="text-sm mt-1">{pickupStatusMessage.body}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Documents:</span> {order.documents?.length || 0}</div>
                      <div><span className="font-medium">Payment:</span> {order.paymentMode}</div>
                      <div><span className="font-medium">Pickup:</span> {order.pickupOption}</div>
                      <div><span className="font-medium">Total:</span> ₹{calculateOrderTotalFromOrder(order)}</div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

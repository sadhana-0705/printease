import { useState, useEffect } from "react";
import NetCentreOrderCard from "../../components/netcentre/NetCentreOrderCard";
import Card from "../../components/ui/Card";
import { useNotification } from "../../hooks/useNotification";
import { getNetCentreOrders, updateOrderStatus as updateOrderStatusService } from "../../services/orderService";
import { acceptOrder as acceptOrderService, rejectOrder as rejectOrderService, clearOrder as clearOrderService } from "../../services/netCentreService";

export default function NetCentreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  


  const { showNotification } = useNotification();

  // Fetch orders when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getNetCentreOrders();
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

  const acceptOrder = async (id) => {
    try {
      const response = await acceptOrderService(id);
      setOrders(prev =>
        prev.map((o) =>
          o._id === id ? { ...o, status: "accepted" } : o
        )
      );
      showNotification(response.message || "Order accepted");
    } catch (error) {
      console.error("Error accepting order:", error);
      showNotification("Failed to accept order", "error");
    }
  };

  const rejectOrder = async (id) => {
    try {
      const response = await rejectOrderService(id);
      setOrders(prev =>
        prev.filter((o) => o._id !== id)
      );
      showNotification(response.message || "Order rejected", "error");
    } catch (error) {
      console.error("Error rejecting order:", error);
      showNotification("Failed to reject order", "error");
    }
  };



  const updateStatus = async (id, newStatus) => {
    try {
      if (newStatus === "cleared") {
        // For cleared status, actually delete the order from backend
        const response = await clearOrderService(id);
        // Remove from local state after successful deletion
        setOrders(prev => prev.filter(o => o._id !== id));
        showNotification(response.message || "Order cleared successfully");
      } else {
        const response = await updateOrderStatusService(id, newStatus);
        setOrders(prev =>
          prev.map((o) =>
            o._id === id ? { ...o, ...(response.order || {}), status: response.order?.status || newStatus } : o
          )
        );
        showNotification(response.message || "Order status updated");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showNotification("Failed to update order status", "error");
    }
  };

  return (
    <div className="space-y-4 min-h-[70vh]">
      <h1 className="text-2xl font-bold">Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <Card>
          <p className="text-center py-8">No orders found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <NetCentreOrderCard
              key={order._id}
              order={order}
              onAccept={() => acceptOrder(order._id)}
              onReject={() => rejectOrder(order._id)}
              onUpdateStatus={(orderId, newStatus) => updateStatus(orderId, newStatus)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

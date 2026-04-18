import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { getMyOrders, deleteOrder } from "../../services/orderService";
import { useNotification } from "../../hooks/useNotification";
import { buildFileUrl } from "../../config/api";
import { calculateOrderTotalFromOrder } from "../../utils/orderPricing";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
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
  
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  
  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };
  
  const handleDeleteOrder = async (orderId) => {
    
    try {
      await deleteOrder(orderId);
      showNotification("Order deleted successfully!");
      // Refresh the orders list
      const fetchedOrders = await getMyOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error deleting order:", error);
      showNotification("Failed to delete order", "error");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        orders.map((order) => (
          <Card key={order._id || order.id}>
            <div 
              className="cursor-pointer hover:bg-gray-50 rounded p-2 transition-colors"
              onClick={() => handleViewOrderDetails(order)}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Order #{order._id || order.id}</p>
                  <p className="text-sm">Net Centre: {order.netCentreId?.name || 'Unknown'}</p>
                  <p className="text-sm">
                    Documents: {order.documents?.length || 0} | Payment: {order.paymentMode}
                  </p>
                  <p className="text-sm">
                    Total: ₹{calculateOrderTotalFromOrder(order)}
                  </p>
                  <p className="font-semibold">
                    Status: <Badge text={order.status} status={order.status} />
                  </p>
                </div>
              </div>
            </div>
            
            {["pending", "completed", "delivered", "rejected"].includes(order.status) && (
              <div className="mt-2">
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOrder(order._id);
                  }}
                >
                  {order.status === 'pending' ? 'Delete Order' : 'Clear Order'}
                </Button>
              </div>
            )}
          </Card>
        ))
      )}
      
      {/* Order Details Modal */}
      <Modal 
        title="Order Details" 
        open={showOrderDetails} 
        onClose={handleCloseOrderDetails}
      >
        {selectedOrder && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Net Centre:</span> {selectedOrder.netCentreId?.name || 'Unknown'}</div>
              <div><span className="font-medium">Status:</span> <Badge text={selectedOrder.status} status={selectedOrder.status} /></div>
              <div><span className="font-medium">Payment:</span> {selectedOrder.paymentMode}</div>
              <div><span className="font-medium">Pickup:</span> {selectedOrder.pickupOption}</div>
              <div><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Document Details:</h3>
              {selectedOrder.documents?.map((doc, index) => (
                <div key={index} className="text-sm border-b pb-2 mb-2 last:border-b-0 last:mb-0">
                  <div><span className="font-medium">File:</span> {doc.fileUrl?.split('/').pop() || 'N/A'}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-medium">Type:</span> {doc.fileType || 'N/A'}</div>
                    <div><span className="font-medium">Pages:</span> {doc.pages || 'N/A'}</div>
                    <div><span className="font-medium">Copies:</span> {doc.copies || 'N/A'}</div>
                    <div><span className="font-medium">Color:</span> {doc.color ? 'Color' : 'Black & White'}</div>
                    <div><span className="font-medium">Sides:</span> {doc.sides || 'N/A'}</div>
                    <div><span className="font-medium">Cost per page:</span> ₹{doc.costPerPage || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>₹{calculateOrderTotalFromOrder(selectedOrder)}</span>
              </div>
              
              {selectedOrder.documents && selectedOrder.documents.length > 0 && (
                <div className="mt-4">
                  <a 
                    href={buildFileUrl(selectedOrder.documents[0]?.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
            
            <div className="pt-4 flex gap-3">
              {["completed", "delivered", "rejected"].includes(selectedOrder.status) && (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={async () => {
                    await handleDeleteOrder(selectedOrder._id);
                    handleCloseOrderDetails();
                  }}
                >
                  Clear Order
                </Button>
              )}
              <Button onClick={handleCloseOrderDetails} variant="secondary" className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

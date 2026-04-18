import { useState } from "react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { buildFileUrl } from "../../config/api";
import { calculateOrderTotalFromOrder } from "../../utils/orderPricing";

function getActionButtons(order) {
  const isDeliveryOrder = order.deliveryType === "delivery";

  if (order.status === "pending") {
    return ["accept", "reject"];
  }

  if (order.status === "accepted") {
    return ["printing"];
  }

  if (order.status === "printing") {
    return ["ready"];
  }

  if (order.status === "available") {
    return [];
  }

  if (order.status === "ready") {
    return isDeliveryOrder ? [] : ["completed"];
  }

  if (
    isDeliveryOrder &&
    (order.status === "picked_up" ||
      order.status === "out_for_delivery" ||
      order.status === "delivered")
  ) {
    return ["cleared"];
  }

  if (order.status === "completed" || order.status === "rejected") {
    return ["cleared"];
  }

  return [];
}

export default function NetCentreOrderCard({
  order,
  onAccept,
  onReject,
  onUpdateStatus,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const actions = getActionButtons(order);
  
  const handleViewDetails = (e) => {
    e.stopPropagation();
    setShowDetails(true);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  return (
    <div className="relative" style={{minHeight: '120px'}}>
      
      <Card className={`border rounded-lg p-4 space-y-3 ${showDetails ? 'pointer-events-none opacity-60' : 'card-hover hover-lift'}`}>
        <div 
          className={`rounded p-2 transition-colors ${showDetails ? '' : 'cursor-pointer hover:bg-gray-50'}`}
          onClick={showDetails ? undefined : handleViewDetails}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{order.studentName || 'Unknown Student'}</p>
              <p className="text-sm text-gray-500">
                Documents: {order.documents?.length || 0} | Copies: {order.documents?.length > 0 ? order.documents[0].copies : 0}
              </p>
            </div>
            <Badge text={order.status} status={order.status} />
          </div>

          <p className="text-sm text-gray-600">
            Payment: {order.paymentMode} | Pickup: {order.pickupOption}
          </p>
          
          {/* File Information */}
          {order.documents && order.documents.length > 0 && (
            <div className="text-sm">
              <p className="font-medium">File: {order.documents[0]?.fileUrl?.split('/').pop() || 'N/A'}</p>
              <p>Type: {order.documents[0]?.fileType || 'N/A'} | Pages: {order.documents[0]?.pages || 'N/A'}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {actions.includes("accept") && (
            <>
              <Button onClick={(e) => { e.stopPropagation(); onAccept(); }}>Accept</Button>
              <Button variant="danger" onClick={(e) => { e.stopPropagation(); onReject(); }}>
                Reject
              </Button>
            </>
          )}

          {actions.includes("printing") && (
            <Button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, "printing"); }}>
              Printing
            </Button>
          )}

          {actions.includes("ready") && (
            <Button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, "ready"); }}>
              Ready
            </Button>
          )}

          {actions.includes("completed") && (
            <Button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, "completed"); }}>
              Completed
            </Button>
          )}
          
          {actions.includes("cleared") && (
            <div className="flex gap-2 flex-wrap">
              {order.status === "completed" && (
                <Button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, "completed"); }}>
                  Completed
                </Button>
              )}

              <Button variant="danger" onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, "cleared"); }}>
                Clear Order
              </Button>
            </div>
          )}

          {order.deliveryType === "delivery" && order.status === "available" && (
            <p className="text-sm text-gray-600">
              Waiting for the nearest delivery boy to accept this order.
            </p>
          )}

          {(order.status === "assigned" || order.status === "picked_up" || order.status === "out_for_delivery" || order.status === "delivered") && (
            <p className="text-sm text-gray-600">
              {order.status === "assigned" && "Assigned to a delivery boy."}
              {order.status === "picked_up" && "Picked up by the delivery boy."}
              {order.status === "out_for_delivery" && "Order is currently out for delivery."}
              {order.status === "delivered" && "Delivered to the student. Waiting to be cleared."}
            </p>
          )}
        </div>
      </Card>

      {/* Order Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden mx-4 my-8">
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Order Details</h2>
                <button 
                  onClick={handleCloseDetails}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold p-1 rounded hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Student:</span> {order.studentName || 'Unknown'}</div>
                  <div><span className="font-medium">Status:</span> <Badge text={order.status} status={order.status} /></div>
                  <div><span className="font-medium">Payment:</span> {order.paymentMode}</div>
                  <div><span className="font-medium">Pickup:</span> {order.pickupOption}</div>
                  <div><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleString()}</div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Document Details:</h3>
                  {order.documents?.map((doc, index) => (
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
                    <span>₹{calculateOrderTotalFromOrder(order)}</span>
                  </div>
                  
                  {order.documents && order.documents.length > 0 && (
                    <div className="mt-4">
                      <a 
                        href={buildFileUrl(order.documents[0]?.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Download File
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <Button 
                onClick={handleCloseDetails} 
                variant="secondary" 
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

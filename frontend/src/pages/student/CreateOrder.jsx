import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import NetCentreMap from "../../components/map/NetCentreMap";

import { useNetCentres } from "../../contexts/NetCentreContext";
import { useNotification } from "../../hooks/useNotification";
import { createOrder as createOrderService } from "../../services/orderService";
import { uploadFile } from "../../services/uploadService";

import { calculateDistance } from "../../utils/calculateDistance";
import { calculateTotalCost } from "../../utils/calculateTotalCost";

export default function CreateOrder() {
  const [pages, setPages] = useState(1);
  const [cp, setCp] = useState(2); // cost per page
  const [copies, setCopies] = useState(1);
  
  // Additional costs
  const [colorCost, _setColorCost] = useState(10); // additional cost for color printing
  const [bindingCost, _setBindingCost] = useState(20); // additional cost for binding

  const [color, setColor] = useState("bw");
  const [sides, setSides] = useState("single");
  const [binding, setBinding] = useState("no");

  const [pickupMethod, setPickupMethod] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [location, setLocation] = useState(null);
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [lastSelectedCentre, setLastSelectedCentre] = useState(null); // Keep track of last selected centre
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlacementStatus, setOrderPlacementStatus] = useState(null); // null, 'success', 'clear'
  const [orderSummaryData, setOrderSummaryData] = useState(null); // Store order summary data after placement
  const [preservedFormData, setPreservedFormData] = useState(null); // Store form data after successful order placement
  const isDeliveryTypeLocked = orderPlacementStatus === "success";

  const { netCentres, loading } = useNetCentres();
  const { showNotification } = useNotification();

  const totalCost = calculateTotalCost(cp, pages, copies, color, binding, colorCost, bindingCost);

  /* 📍 Get student location */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => alert("Location permission denied")
    );
  }, []);

  const centresWithDistance =
    location && netCentres.length > 0
      ? netCentres.map((nc) => ({
          ...nc,
          distance: calculateDistance(
            location.lat,
            location.lng,
            nc.lat,
            nc.lng
          ),
        })).sort((a, b) => a.distance - b.distance) // Sort by distance (closest first)
      : [];

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const placeOrder = async () => {
    setIsSubmitting(true);
    try {
      if (!file) {
        showNotification("Please upload a supported document before placing the order.", "error");
        return;
      }

      let fileUrl = "";
      let fileType = "pdf";

      setUploading(true);
      try {
        const uploadResponse = await uploadFile(file);
        fileUrl = uploadResponse.file.path;
        fileType = file.type.split('/')[1]; // Get file extension from MIME type
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        showNotification(
          uploadError.response?.data?.message || "File upload failed. Please upload a supported document and try again.",
          "error"
        );
        return;
      } finally {
        setUploading(false);
      }
      
      // Prepare order data in the format expected by the backend
      const orderData = {
        netCentreId: selectedCentre._id || selectedCentre.id, // Use the correct ID field
        documents: [{
          fileUrl,
          fileType,
          copies, // Use the number of copies from form
          color: color === "color", // Convert to boolean
          sides: sides, // This matches the enum in the schema
          pages: pages, // Include pages from form
          costPerPage: cp, // Include cost per page from form
          colorCost, // Additional cost for color
          bindingCost, // Additional cost for binding
          binding: binding === "yes" // Convert binding to boolean
        }],
        paymentMode: paymentMethod,
        pickupOption: pickupMethod === "pickup" ? "self" : "delivery", // Convert to expected values
        totalCost: totalCost, // Include the calculated total cost
        location: location || undefined
      };
      
      console.log("Sending order data:", orderData);
      
      const response = await createOrderService(orderData);
      
      // Save the selected centre and current form values before clearing
      setLastSelectedCentre(selectedCentre);
      setOrderSummaryData({
        pages,
        cp,
        copies,
        color,
        sides,
        binding,
        pickupMethod,
        paymentMethod,
        totalCost,
        colorCost,
        bindingCost,
        fileName: file?.name
      });
      
      // Preserve form data for display after order placement
      setPreservedFormData({
        pages,
        cp,
        copies,
        color,
        sides,
        binding,
        pickupMethod,
        paymentMethod,
        colorCost,
        bindingCost,
        file
      });
      
      showNotification(response.message || "Order placed successfully!");
      setOrderPlacementStatus('success');
    } catch (error) {
      console.error("Error placing order:", error);
      console.error("Error details:", error.response?.data || error.message);
      showNotification(`Failed to place order. ${error.response?.data?.message || error.message || 'Please try again.'}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCentre) return;

    if (paymentMethod === "online") {
      setShowPaymentModal(true);
      return;
    }

    await placeOrder();
  };

  const handleClear = () => {
    setPages(1);
    setCp(2);
    setCopies(1); // Clear copies to default
    setColor("bw");
    setSides("single");
    setBinding("no");
    setPickupMethod("pickup");
    setPaymentMethod("cash");
    setSelectedCentre(null);
    setLastSelectedCentre(null); // Clear the last selected centre when starting a new order
    setOrderPlacementStatus(null); // Reset order placement status
    setShowPaymentModal(false);
    setOrderSummaryData(null); // Clear the summary data
    setPreservedFormData(null); // Clear preserved form data
    setFile(null); // Clear selected file
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT: FORM */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Create Print Order</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Number of Pages"
            type="number"
            value={pages}
            onChange={(e) => setPages(+e.target.value)}
          />

          <Input
            label="Cost Per Page (₹)"
            type="number"
            value={cp}
            readOnly
            className="bg-gray-100 cursor-not-allowed text-gray-500 font-semibold"
          />

          <Input
            label="Number of Copies"
            type="number"
            value={copies}
            onChange={(e) => setCopies(+e.target.value)}
          />

          {/* COLOR */}
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={color === "bw"}
                onChange={() => setColor("bw")}
              />{" "}
              Black & White
            </label>
            <label>
              <input
                type="radio"
                checked={color === "color"}
                onChange={() => setColor("color")}
              />{" "}
              Color
            </label>
          </div>

          {/* SIDES */}
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={sides === "single"}
                onChange={() => setSides("single")}
              />{" "}
              Single-sided
            </label>
            <label>
              <input
                type="radio"
                checked={sides === "double"}
                onChange={() => setSides("double")}
              />{" "}
              Double-sided
            </label>
          </div>

          {/* BINDING */}
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={binding === "no"}
                onChange={() => setBinding("no")}
              />{" "}
              No Binding
            </label>
            <label>
              <input
                type="radio"
                checked={binding === "yes"}
                onChange={() => setBinding("yes")}
              />{" "}
              Binding
            </label>
          </div>

          {/* PICKUP */}
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={pickupMethod === "pickup"}
                disabled={isDeliveryTypeLocked}
                onChange={() => setPickupMethod("pickup")}
              />{" "}
              Pickup{pickupMethod === "pickup" ? " (Selected)" : ""}
            </label>
            <label>
              <input
                type="radio"
                checked={pickupMethod === "delivery"}
                disabled={isDeliveryTypeLocked}
                onChange={() => setPickupMethod("delivery")}
              />{" "}
              Delivery{pickupMethod === "delivery" ? " (Selected)" : ""}
            </label>
          </div>

          {/* PAYMENT */}
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />{" "}
              Cash
            </label>
            <label>
              <input
                type="radio"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />{" "}
              Online
            </label>
          </div>

          {/* FILE UPLOAD */}
          <div>
            <Input
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              label="Upload Document"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* NET CENTRES */}
          {location && (
            <>
              <h3 className="font-semibold">Nearby Net Centres</h3>

              {loading ? (
                <p className="text-sm text-gray-500">Loading net centres...</p>
              ) : centresWithDistance.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No net centres registered yet
                </p>
              ) : null}

              {centresWithDistance.map((nc) => (
                <label
                  key={nc._id || nc.id}
                  className={`flex justify-between p-2 border rounded cursor-pointer ${
                    selectedCentre?.id === nc.id
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                >
                  <span>
                    <input
                      type="radio"
                      name="netcentre"
                      checked={selectedCentre?.id === nc.id}
                      onChange={() => setSelectedCentre(nc)}
                    />{" "}
                    {nc.name}
                  </span>
                  <span>{nc.distance} km</span>
                </label>
              ))}

              <NetCentreMap
                userLocation={location}
                netCentres={netCentres}
              />
            </>
          )}

          {!selectedCentre && (
            <p className="text-sm text-red-500">
              Please select a net centre
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={!selectedCentre || isSubmitting || uploading}>
              {isSubmitting ? "Placing Order..." : uploading ? "Uploading File..." : "Place Order"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {orderPlacementStatus === "success" && lastSelectedCentre && (
            <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
              Order placed successfully at <strong>{lastSelectedCentre.name}</strong>.
            </div>
          )}
        </form>
      </Card>

      {/* RIGHT: SUMMARY */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        {orderPlacementStatus === 'success' && lastSelectedCentre ? (
          <>
            <p>Pages: {orderSummaryData?.pages || pages}</p>
            <p>CP: ₹{orderSummaryData?.cp || cp}</p>
            <p>Copies: {orderSummaryData?.copies || copies}</p>
            <p>Color: {(orderSummaryData?.color || color)} {(orderSummaryData?.color || color) === "color" && `(+₹${orderSummaryData?.colorCost || colorCost})`}</p>
            <p>Sides: {orderSummaryData?.sides || sides}</p>
            <p>Binding: {(orderSummaryData?.binding || binding)} {(orderSummaryData?.binding || binding) === "yes" && `(+₹${orderSummaryData?.bindingCost || bindingCost})`}</p>
            <p>Pickup: {orderSummaryData?.pickupMethod || pickupMethod}</p>
            <p>Payment: {orderSummaryData?.paymentMethod || paymentMethod}</p>
            {(orderSummaryData?.fileName || file) && <p>File: {orderSummaryData?.fileName || file?.name}</p>}
            <p>
              Net Centre: {" "}
              <strong>
                {`Order placed at ${lastSelectedCentre.name}`}
              </strong>
            </p>
            <hr className="my-3" />
            <p className="font-semibold">Total: ₹{orderSummaryData?.totalCost || totalCost}</p>
          </>
        ) : (
          <>
            <p>Pages: {preservedFormData?.pages || pages}</p>
            <p>CP: ₹{preservedFormData?.cp || cp}</p>
            <p>Copies: {preservedFormData?.copies || copies}</p>
            <p>Color: {(preservedFormData?.color || color)} {(preservedFormData?.color || color) === "color" && `(+₹${preservedFormData?.colorCost || colorCost})`}</p>
            <p>Sides: {preservedFormData?.sides || sides}</p>
            <p>Binding: {(preservedFormData?.binding || binding)} {(preservedFormData?.binding || binding) === "yes" && `(+₹${preservedFormData?.bindingCost || bindingCost})`}</p>
            <p>Pickup: {preservedFormData?.pickupMethod || pickupMethod}</p>
            <p>Payment: {preservedFormData?.paymentMethod || paymentMethod}</p>
            {(preservedFormData?.file || file) && <p>File: {preservedFormData?.file?.name || file?.name}</p>}
            <p>
              Net Centre: {" "}
              <strong>
                {selectedCentre ? selectedCentre.name : (orderPlacementStatus === 'success' && lastSelectedCentre ? `Order placed at ${lastSelectedCentre.name}` : "Not selected")}
              </strong>
            </p>
            <hr className="my-3" />
            <p className="font-semibold">Total: ₹{totalCost}</p>
          </>
        )}
      </Card>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-3">Confirm Payment</h2>
            <p>Amount: ₹{totalCost}</p>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowPaymentModal(false);
                  placeOrder();
                }}
              >
                Proceed to Pay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";

/* Auth pages */
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

/* Student pages */
import StudentDashboard from "../pages/student/Dashboard";
import UploadDocument from "../pages/student/UploadDocument";
import CreateOrder from "../pages/student/CreateOrder";
import StudentOrders from "../pages/student/Orders";

/* Net Centre pages */
import NetCentreDashboard from "../pages/netcentre/Dashboard";
import NetCentreOrders from "../pages/netcentre/Orders";
import DeliveryHome from "../pages/delivery/Dashboard";
import DeliveryDashboard from "../pages/delivery/DeliveryDashboard";
import DeliveryMap from "../pages/delivery/DeliveryMap";

/* Student Status Page */
import OrderStatus from "../pages/student/OrderStatus";

/* Home page */
function Home() {
  return (
    <div className="flex justify-center items-center min-h-[70vh] py-8 w-full bg-gradient-to-br from-[#e6e6fa] to-[#d8bfd8]">
      <div className="w-full max-w-4xl mx-4 px-4">
        <div className="bg-gradient-to-br from-[#e0ffff] to-[#b0e0e6] border border-gray-300 shadow-lg rounded-xl p-6 md:p-8 text-center w-full min-h-[300px] flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-[#1a2844]">
            Welcome to Printease
          </h1>
          <p className="text-gray-600 mt-4 text-base md:text-lg">
            Print your documents easily from nearby net centres
          </p>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center flex-grow">
            <Link 
              to="/login" 
              className="px-6 py-3 bg-[#4a90e2] text-white rounded-lg font-medium hover:bg-[#357abd] transition-colors inline-block w-full sm:w-auto text-center"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-3 bg-[#50c878] text-white rounded-lg font-medium hover:bg-[#3aa15f] transition-colors inline-block w-full sm:w-auto text-center"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student routes */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/upload"
        element={
          <ProtectedRoute role="student">
            <UploadDocument />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/create-order"
        element={
          <ProtectedRoute role="student">
            <CreateOrder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/orders"
        element={
          <ProtectedRoute role="student">
            <StudentOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/status"
        element={
          <ProtectedRoute role="student">
            <OrderStatus />
          </ProtectedRoute>
        }
      />

      {/* Net centre routes */}
      <Route
        path="/netcentre-dashboard"
        element={
          <ProtectedRoute role={["netcentre_admin", "netcentre_staff"]}>
            <NetCentreDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/netcentre/dashboard"
        element={
          <ProtectedRoute role={["netcentre_admin", "netcentre_staff"]}>
            <NetCentreDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/netcentre/orders"
        element={
          <ProtectedRoute role={["netcentre_admin", "netcentre_staff"]}>
            <NetCentreOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery-dashboard"
        element={
          <ProtectedRoute role="delivery_boy">
            <DeliveryHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery/orders/:section"
        element={
          <ProtectedRoute role="delivery_boy">
            <DeliveryDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/delivery-map/:orderId"
        element={
          <ProtectedRoute role="delivery_boy">
            <DeliveryMap />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

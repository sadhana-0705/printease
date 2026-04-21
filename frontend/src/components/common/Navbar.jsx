import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-[#16a085] border-b-2 border-[#2ecc71] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-[#ffffff] hover:text-[#f1c40f] transition-colors">
          Printease
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          {!user && (
            <>
              <Link to="/login" className="text-[#ffffff] hover:text-[#f1c40f] transition-colors px-3 py-2 rounded-md hover:bg-[#f1c40f]/20">
                Login
              </Link>
              <Link to="/register" className="text-[#ffffff] hover:text-[#f1c40f] transition-colors px-3 py-2 rounded-md hover:bg-[#f1c40f]/20">
                Register
              </Link>
            </>
          )}

          {user?.role === "student" && (
            <>
              <Link to="/student/dashboard" className="text-[#ffffff] hover:text-[#f1c40f] transition-colors px-3 py-2 rounded-md hover:bg-[#8e44ad]/20 text-lg">
                Dashboard
              </Link>
              <Link to="/student/upload" className="text-[#ffffff] hover:text-[#f1c40f] transition-colors px-3 py-2 rounded-md hover:bg-[#8e44ad]/20 text-lg">
                Upload Documents
              </Link>
              <Link to="/student/orders" className="text-[#ffffff] hover:text-[#f1c40f] transition-colors px-3 py-2 rounded-md hover:bg-[#8e44ad]/20 text-lg">
                My Orders
              </Link>
            </>
          )}

          {(user?.role === "netcentre_admin" || user?.role === "netcentre_staff") && (
            <>
              <Link to="/netcentre/dashboard" className="text-[#ffffff] hover:text-[#f1c40f] transition-colors px-3 py-2 rounded-md hover:bg-[#8e44ad]/20 text-lg">
                Dashboard
              </Link>
              <Link to="/netcentre/orders" className="text-[#ffffff] hover:text-[#f1c40f] transition-colors px-3 py-2 rounded-md hover:bg-[#8e44ad]/20 text-lg">
                Orders
              </Link>
            </>
          )}

          {user?.role === "delivery_boy" && (
            <>
              <Link to="/delivery-dashboard" className="text-[#ffffff] hover:text-[#f1c40f] transition-colors px-3 py-2 rounded-md hover:bg-[#8e44ad]/20 text-lg">
                Dashboard
              </Link>
              <Link to="/delivery/orders/available" className="text-[#ffffff] hover:text-[#f1c40f] transition-colors px-3 py-2 rounded-md hover:bg-[#8e44ad]/20 text-lg">
                Deliveries
              </Link>
            </>
          )}

          {user && (
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}


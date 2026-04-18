import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useNetCentres } from "../../contexts/NetCentreContext";
import { register } from "../../services/authService";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../hooks/useNotification";

export default function RegisterForm() {
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // For netcentres, we'll create the netcentre along with the user
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [deliveryLocationStatus, setDeliveryLocationStatus] = useState("");

  const { refreshNetCentres } = useNetCentres();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const isNetCentreRole = role === "netcentre";
  const isDeliveryRole = role === "delivery_boy";

  const handleClear = () => {
    setName("");
    setEmail("");
    setPassword("");
    setAddress("");
    setCity("");
    setSuccessMsg("");
    setErrorMsg("");
    setDeliveryLocationStatus("");
    setRole("student");
  };

  const getLocationAndFillAddress = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const locationData = await response.json();
            
            if (locationData.address) {
              const fullAddress = locationData.display_name || `Near ${position.coords.latitude}, ${position.coords.longitude}`;
              const cityName = locationData.address.city || 
                              locationData.address.town || 
                              locationData.address.village || 
                              locationData.address.county || 'Unknown City';
              
              setAddress(fullAddress);
              setCity(cityName);
              showNotification('Location fetched successfully!', 'success');
            }
          } catch (error) {
            console.error('Error fetching address from coordinates:', error);
            showNotification('Could not fetch address from location', 'error');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          showNotification('Could not get your location. Please enable location services.', 'error');
        }
      );
    } else {
      showNotification('Geolocation is not supported by this browser', 'error');
    }
  };

  const getLocationDetails = async () => {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by this browser");
    }

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    let resolvedAddress = "";

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
      );
      const locationData = await response.json();
      resolvedAddress = locationData.display_name || "";
    } catch (error) {
      console.warn("Could not reverse geocode registration location:", error);
    }

    return {
      location,
      address: resolvedAddress
    };
  };

  const handleDeliveryLocationFetch = async () => {
    try {
      const locationDetails = await getLocationDetails();
      if (locationDetails.address) {
        setDeliveryLocationStatus(`Location ready: ${locationDetails.address}`);
      } else {
        setDeliveryLocationStatus(
          `Location ready: ${locationDetails.location.lat}, ${locationDetails.location.lng}`
        );
      }
      showNotification("Delivery location fetched successfully!", "success");
    } catch (error) {
      console.error("Could not fetch delivery location:", error);
      setDeliveryLocationStatus("Could not fetch current location");
      showNotification("Could not fetch current location", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isNetCentreRole) {
        // For netcentre role, we first create the netcentre, then the user
        // We'll use geolocation to get coordinates
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                let resolvedAddress = address;
                let resolvedCity = city;
                
                // If address is not provided, try to get it from coordinates using reverse geocoding
                if (!address || !city) {
                  try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                    const locationData = await response.json();
                    
                    if (locationData.address) {
                      resolvedAddress = resolvedAddress || locationData.display_name || `Near ${pos.coords.latitude}, ${pos.coords.longitude}`;
                      resolvedCity = resolvedCity || locationData.address.city || 
                                   locationData.address.town || 
                                   locationData.address.village || 
                                   locationData.address.county || 'Unknown City';
                    }
                  } catch (reverseGeoErr) {
                    console.warn('Could not fetch address from coordinates:', reverseGeoErr);
                    resolvedAddress = resolvedAddress || `Near ${pos.coords.latitude}, ${pos.coords.longitude}`;
                    resolvedCity = resolvedCity || 'Unknown City';
                  }
                }
                
                // First create the netcentre
                const { data: netCentreData } = await api.post("/netcentres", {
                    name,
                    address: resolvedAddress,
                    city: resolvedCity,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                
                // Now register the user with the new netcentre ID
                const userData = {
                  name,
                  email,
                  password,
                  role: "netcentre_admin", // netcentres become admins of their own centre
                  netCentreId: netCentreData._id,
                  location: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                  }
                };
                
                const response = await register(userData);
                setSuccessMsg(response.data.message || "Registration successful!");
                
                // Refresh netcentres to include the new one
                refreshNetCentres();
                
                // Redirect to login after a delay
                setTimeout(() => {
                  navigate("/login");
                }, 2000);
              } catch (err) {
                setErrorMsg(err.message || "Error creating net centre");
              } finally {
                setLoading(false);
              }
            },
            (err) => {
              setErrorMsg("Location permission required to create net centre: " + err.message);
              setLoading(false);
            }
          );
        } else {
          setErrorMsg("Geolocation is not supported by this browser");
          setLoading(false);
        }
      } else {
        // For students and delivery boys, register directly
        let userLocation = {
          lat: null,
          lng: null
        };
        let userAddress = "";

        if (navigator.geolocation) {
          try {
            const locationDetails = await getLocationDetails();
            userLocation = locationDetails.location;
            userAddress = locationDetails.address;
          } catch (geoError) {
            console.warn("Could not capture user location during registration:", geoError);
          }
        }

        const userData = {
          name,
          email,
          password,
          role,
          location: userLocation,
          address: role === "delivery_boy" ? userAddress : ""
        };
        
        const response = await register(userData);
        setSuccessMsg(response.data.message || "Registration successful!");
        
        // Clear form after successful registration
        setName("");
        setEmail("");
        setPassword("");
        
        // Redirect to login after a delay
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        
        setLoading(false);
      }
    } catch (error) {
      if (error.response) {
        setErrorMsg(error.response.data.message || "Registration failed");
      } else {
        setErrorMsg("Network error. Please try again.");
      }
      setLoading(false);
    }
  };



  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">Register</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={
            isNetCentreRole
              ? "Net Centre Name"
              : isDeliveryRole
                ? "Delivery Boy Name"
                : "Student Name"
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {isNetCentreRole && (
          <>
            <div className="flex items-center gap-2">
              <Input
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={getLocationAndFillAddress}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                title="Use current location"
              >
                📍
              </button>
            </div>
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </>
        )}

        {isDeliveryRole && (
          <div>
            <button
              type="button"
              onClick={handleDeliveryLocationFetch}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              title="Use current location"
            >
              Use Current Location
            </button>
            {deliveryLocationStatus && (
              <p className="text-sm text-gray-600 mt-2">{deliveryLocationStatus}</p>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              checked={role === "student"}
              onChange={() => setRole("student")}
            />{" "}
            Student
          </label>

          <label>
            <input
              type="radio"
              checked={role === "netcentre"}
              onChange={() => setRole("netcentre")}
            />{" "}
            Net Centre
          </label>

          <label>
            <input
              type="radio"
              checked={role === "delivery_boy"}
              onChange={() => setRole("delivery_boy")}
            />{" "}
            Delivery Boy
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClear}>
            Clear
          </Button>
        </div>

        {successMsg && (
          <p className="text-green-600 text-sm">{successMsg}</p>
        )}
        
        {errorMsg && (
          <p className="text-red-600 text-sm">{errorMsg}</p>
        )}
      </form>
    </Card>
  );
}

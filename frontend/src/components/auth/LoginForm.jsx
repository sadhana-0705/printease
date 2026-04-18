import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { login as authServiceLogin } from "../../services/authService";
import { apiOrigin } from "../../config/api";

export default function LoginForm() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = await authServiceLogin(email, password);

      const normalizedSelectedRole = role === "netcentre" ? "netcentre_admin" : role;
      const isMatchingNetCentreRole =
        role === "netcentre" &&
        (data.user.role === "netcentre_admin" || data.user.role === "netcentre_staff");

      if (data.user.role !== normalizedSelectedRole && !isMatchingNetCentreRole) {
        alert(`This account is registered as ${data.user.role}. Please use the correct login flow.`);
        return;
      }
      
      // Update auth context
      login(data.user);
      
      // Navigate based on user role
      if (data.user.role === "student") {
        navigate("/student-dashboard");
      } else if (data.user.role === "netcentre_admin" || data.user.role === "netcentre_staff") {
        navigate("/netcentre-dashboard");
      } else if (data.user.role === "delivery_boy") {
        navigate("/delivery-dashboard");
      } else {
        navigate("/"); // Default fallback
      }
    } catch (error) {
      console.error("Login failed:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      console.error("Error message:", error.message);
      
      if (error.response) {
        // Server responded with error status
        alert(`Login failed: ${error.response.status} - ${error.response.data?.message || "Server error"}`);
      } else if (error.request) {
        // Request was made but no response received
        alert(`Login failed: Unable to connect to the server. Please make sure the backend is running and reachable at ${apiOrigin}`);
      } else {
        // Something else happened
        alert(`Login failed: ${error.message || "An error occurred"}`);
      }
    }
  };

  const handleClear = () => {
    setRole("student");
    setEmail("");
    setPassword("");
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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



        <div className="flex gap-2">
          <Button type="submit">Login</Button>
          <Button type="button" variant="secondary" onClick={handleClear}>Clear</Button>
        </div>
      </form>
    </Card>
  );
}

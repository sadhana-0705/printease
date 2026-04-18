import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { OrdersProvider } from "./contexts/OrdersContext";
import { NetCentreProvider } from "./contexts/NetCentreContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import "./styles/index.css";
import "./styles/theme.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NetCentreProvider>
          <OrdersProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </OrdersProvider>
        </NetCentreProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

# PrintEase 🖨️

PrintEase is a hyper-local document printing and delivery platform designed to bridge the gap between students, local printing centers (Net Centres), and delivery partners.

## 🚀 Features

### For Students
- **Smart Ordering**: Upload documents and configure print settings (B&W/Color, Single/Double-sided, Binding).
- **Real-time Pricing**: Automated cost calculation based on document properties and selected options.
- **Service Discovery**: Find the nearest Net Centres using integrated Leaflet.js maps and geolocation.
- **Live Tracking**: Monitor your order status from "Accepted" to "Delivered" on a real-time map.

### For Net Centres (Shop Owners)
- **Order Management**: A dedicated dashboard to view, accept, and update the status of print jobs.
- **Workflow Automation**: Transition orders through stages: Pending → Accepted → Printing → Ready.
- **Document Access**: Securely access and download student-uploaded documents for printing.

### For Delivery Partners
- **Logistics Dashboard**: View available "Ready" orders for delivery.
- **Optimized Routing**: Clear navigation between Net Centres and student delivery locations.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Vite, Leaflet.js (Maps), Context API.
- **Backend**: Node.js, Express.js (v5), RESTful APIs.
- **Database**: MongoDB with Mongoose ODM.
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).
- **Deployment**: Render (Auto-deployment via `render.yaml`).

## 📁 Project Structure

```text
printease/
├── backend/          # Node.js Express server
├── frontend/         # React Vite application
├── render.yaml       # Deployment configuration
└── package.json      # Workspace settings
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/printease.git
   cd printease
   ```

2. **Install Dependencies**:
   ```bash
   # Install root, backend, and frontend dependencies
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

3. **Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_secret
   ```

4. **Run the application**:
   ```bash
   # Runs both frontend and backend concurrently
   npm run dev
   ```

## 🌐 Deployment

The project is pre-configured for deployment on **Render** using the `render.yaml` blueprint.

1. Connect your GitHub repository to Render.
2. Select the **Blueprint** option.
3. Provide the `MONGO_URI` environment variable in the Render dashboard.
4. Render will automatically build the frontend and serve it via the backend.

## 📄 License

This project is licensed under the ISC License.

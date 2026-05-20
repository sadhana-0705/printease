# PrintEase 🖨️

PrintEase is a hyper-local document printing and delivery platform that connects students, local printing centers (Net Centres), and delivery partners into a single seamless ecosystem.

The platform simplifies the entire printing workflow — from document upload and print customization to real-time order tracking and doorstep delivery.

---

## 🚀 Features

### 👨‍🎓 Student Module
- Upload documents for printing
- Configure print options:
  - Black & White / Color
  - Single-sided / Double-sided
  - Binding options
- Automatic real-time price calculation
- Discover nearby Net Centres using geolocation and interactive maps
- Live order tracking from acceptance to delivery

### 🏪 Net Centre Module
- Dedicated dashboard for managing print requests
- Accept and process incoming orders
- Update order workflow:
  - Pending → Accepted → Printing → Ready
- Secure document access and download functionality

### 🚚 Delivery Partner Module
- View available delivery orders
- Pickup and deliver completed print jobs
- Optimized navigation between shop and customer locations

---

## 🔐 Authentication & Security

- JWT-based Authentication
- Role-Based Access Control (RBAC)
- Protected API routes
- Secure document handling and access management

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Leaflet.js
- Context API

### Backend
- Node.js
- Express.js (v5)
- RESTful APIs

### Database
- MongoDB
- Mongoose ODM

### Deployment
- Render
- render.yaml Blueprint Deployment

---

## 📁 Project Structure

```bash
printease/
├── backend/          # Express backend server
├── frontend/         # React Vite frontend
├── render.yaml       # Render deployment configuration
└── package.json      # Workspace configuration
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account

### Clone the Repository

```bash
git clone https://github.com/your-username/printease.git
cd printease
```

### Install Dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

### Run the Application

```bash
npm run dev
```

This starts both the frontend and backend concurrently.

---

## 🌐 Deployment

The project is pre-configured for deployment on Render using the included `render.yaml` blueprint.

### Deployment Steps

1. Push the project to GitHub
2. Connect the repository to Render
3. Select the **Blueprint** deployment option
4. Add required environment variables in Render:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

### Render Automatically Handles
- Dependency installation
- Frontend build process
- Backend deployment
- Serving the React frontend through Express
- Automatic redeployment on GitHub push

---

## 📌 Future Enhancements

- Online payment integration
- Push notifications for order updates
- AI-based print cost estimation
- Admin analytics dashboard
- In-app messaging system

---

## 📄 License

This project is licensed under the ISC License.

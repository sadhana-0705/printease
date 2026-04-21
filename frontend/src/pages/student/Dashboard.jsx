import Card from "../../components/ui/Card";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 min-h-[70vh] bg-[#f0ead6] rounded-xl p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-primary-800 mb-4">Student Dashboard</h1>
        <p className="text-neutral-600 max-w-3xl mx-auto text-lg">
          Welcome! Manage your print orders and track their progress
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="card-hover hover-lift">
          <div className="p-1">
            <div className="bg-[#4a90e2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-neutral-800">Create New Order</h2>
            <p className="text-neutral-600 mb-4">
              Upload documents and place a new print order with your preferred net centre.
            </p>
            <Link
              to="/student/create-order"
              className="inline-flex items-center text-[#4a90e2] font-medium hover:text-[#357abd] transition-colors"
            >
              Go to Create Order
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </Card>

        <Card className="card-hover hover-lift">
          <div className="p-1">
            <div className="bg-[#4a90e2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m9-13V3a2 2 0 00-2-2H9a2 2 0 00-2 2v0m8 0v0m0 0v8m0-8l-3 3m3-3l-3 3m6-3H9" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-neutral-800">Upload Documents</h2>
            <p className="text-neutral-600 mb-4">
              Upload and manage your documents before creating orders.
            </p>
            <Link
              to="/student/upload"
              className="inline-flex items-center text-[#4a90e2] font-medium hover:text-[#357abd] transition-colors"
            >
              Upload Documents
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </Card>

        <Card className="card-hover hover-lift">
          <div className="p-1">
            <div className="bg-[#4a90e2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-neutral-800">My Orders</h2>
            <p className="text-neutral-600 mb-4">
              View your previous orders and their current status.
            </p>
            <Link
              to="/student/orders"
              className="inline-flex items-center text-[#4a90e2] font-medium hover:text-[#357abd] transition-colors"
            >
              View Orders
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </Card>
        
        <Card className="card-hover hover-lift">
          <div className="p-1">
            <div className="bg-[#4a90e2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-neutral-800">Track Order Status</h2>
            <p className="text-neutral-600 mb-4">
              Check the real-time status of your ongoing orders.
            </p>
            <Link
              to="/student/status"
              className="inline-flex items-center text-[#4a90e2] font-medium hover:text-[#357abd] transition-colors"
            >
              Track Status
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

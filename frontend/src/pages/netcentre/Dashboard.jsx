import Card from "../../components/ui/Card";
import { Link } from "react-router-dom";

export default function NetCentreDashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 min-h-[70vh] bg-[#fdecea] rounded-xl p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-accent-800 mb-4">Net Centre Dashboard</h1>
        <p className="text-neutral-600 max-w-3xl mx-auto text-lg">
          Manage incoming print orders and serve students efficiently
        </p>
      </div>

      <div className="flex justify-center items-center">
        <Card className="card-hover hover-lift w-full max-w-lg">
          <div className="p-1">
            <div className="bg-accent-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-neutral-800">Orders</h2>
            <p className="text-neutral-600 mb-4">
              View and manage new student print requests.
            </p>
            <Link
              to="/netcentre/orders"
              className="inline-flex items-center text-accent-600 font-medium hover:text-accent-700 transition-colors"
            >
              View Orders
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

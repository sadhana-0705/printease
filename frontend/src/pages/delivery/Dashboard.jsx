import Card from "../../components/ui/Card";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { updateMyLocation } from "../../services/authService";

const DELIVERY_SECTIONS = [
  {
    title: "Available Deliveries",
    description: "Review nearby delivery-ready orders and claim the ones you want to handle.",
    cta: "Open Available Deliveries",
    to: "/delivery/orders/available",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    title: "In Progress Deliveries",
    description: "Track deliveries that have been picked up and are currently on the way.",
    cta: "Open In Progress Deliveries",
    to: "/delivery/orders/in-progress",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H6a1 1 0 00-1 1v10a1 1 0 001 1h1m6-1h3m0 0h1a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 8h-2v8zm3 0a2 2 0 11-4 0 2 2 0 014 0zm-10 0a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Completed Deliveries",
    description: "Review your finished deliveries and completed order history.",
    cta: "Open Completed Deliveries",
    to: "/delivery/orders/completed",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function DeliveryDashboardHome() {
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await updateMyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        } catch (error) {
          console.warn("Could not update delivery location:", error);
        }
      },
      (error) => {
        console.warn("Could not get delivery location:", error);
      }
    );
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 min-h-[70vh] bg-[#f0ead6] rounded-xl p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-primary-800 mb-4">Delivery Dashboard</h1>
        <p className="text-neutral-600 max-w-3xl mx-auto text-lg">
          Welcome! Claim nearby delivery orders and track each job through completion
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {DELIVERY_SECTIONS.map((section) => (
          <Card key={section.title} className="card-hover hover-lift">
            <div className="p-1">
              <div className="bg-[#4a90e2] rounded-full w-12 h-12 flex items-center justify-center mb-4">
                {section.icon}
              </div>
              <h2 className="text-xl font-semibold mb-2 text-neutral-800">{section.title}</h2>
              <p className="text-neutral-600 mb-4">
                {section.description}
              </p>
              <Link
                to={section.to}
                className="inline-flex items-center text-[#4a90e2] font-medium hover:text-[#357abd] transition-colors"
              >
                {section.cta}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

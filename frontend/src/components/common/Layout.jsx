import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children, pageType = "default" }) {
  // Different background gradients for different page types
  const getBackgroundClass = () => {
    switch (pageType) {
      case "student":
        return "bg-gradient-student";
      case "netcentre":
        return "bg-gradient-netcentre";
      case "auth":
        return "bg-gradient-auth";
      default:
        return "bg-[#f5f5f5]"; // Off-white background for all pages
    }
  };

  return (
    <div className={`min-h-full min-h-screen flex flex-col ${getBackgroundClass()}`}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="page-container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

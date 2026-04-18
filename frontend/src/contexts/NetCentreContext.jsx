import { createContext, useContext, useState, useEffect } from "react";
import { getNetCentres } from "../services/netCentreService";

const NetCentreContext = createContext();

export function NetCentreProvider({ children }) {
  const [netCentres, setNetCentres] = useState([]);
  const [loading, setLoading] = useState(true);

  const addNetCentre = (centre) => {
    setNetCentres((prev) => [...prev, centre]);
  };
  
  // Function to refresh netcentres from the API
  const refreshNetCentres = async () => {
    try {
      const data = await getNetCentres();
      setNetCentres(data);
    } catch (error) {
      console.error("Error fetching net centres:", error);
    }
  };

  useEffect(() => {
    const fetchNetCentres = async () => {
      try {
        const data = await getNetCentres();
        setNetCentres(data);
      } catch (error) {
        console.error("Error fetching net centres:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNetCentres();
  }, []);

  return (
    <NetCentreContext.Provider value={{ netCentres, loading, addNetCentre, refreshNetCentres }}>
      {children}
    </NetCentreContext.Provider>
  );
}

export function useNetCentres() {
  return useContext(NetCentreContext);
}

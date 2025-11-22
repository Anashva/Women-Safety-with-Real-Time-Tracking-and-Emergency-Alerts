import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MapTracking = () => {
  const [coords, setCoords] = useState({ lat: 28.7041, lng: 77.1025 });
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error("Error watching location:", err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const iframeUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;

  return (
    <div className="container mt-5 text-center">
      <button onClick={() => navigate("/dashboard")} className="btn btn-danger mb-3">
        Back to Dashboard
      </button>

      <h2>📍 My Live Location</h2>
      <iframe
        title="Live Location"
        src={iframeUrl}
        width="100%"
        height="600"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default MapTracking;
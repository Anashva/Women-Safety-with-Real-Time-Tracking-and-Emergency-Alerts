import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords); // update map center
  }, [coords, map]);
  return null;
};

const MapTracking = () => {
  const [coords, setCoords] = useState([28.7041, 77.1025]); // default Delhi

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.error("Error watching location:", err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId); // cleanup
    }
  }, []);
const navigate = useNavigate();
  return (
    <div>
       <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginBottom: "10px",
          padding: "8px 16px",
          backgroundColor: "white",
          color: "black",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        ← Back to Dashboard
      </button>

      <h2>📍 My Location</h2>
      <MapContainer
        center={coords}
        zoom={20}
        style={{ height: "700px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={coords}>
          <Popup>🚶 You are here</Popup>
        </Marker>
        <RecenterMap coords={coords} />
      </MapContainer>
    </div>
  );
};

export default MapTracking;
import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";


const EmergencyButton = () => {
  const [loading, setLoading] = useState(false);
const navigate = useNavigate(); 
  const sendSOS = () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        try {
          const res = await fetch("http://localhost:8080/api/alerts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude,
              longitude,
              message: "Need urgent help!",
            }),
          });

          const data = await res.json();
          alert("🚨 SOS Sent Successfully!");
 navigate("/live-tracking"); 
         

        } catch (err) {
          console.error(err);
          alert("Failed to send SOS");
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert("Could not access location. Enable GPS.");
        setLoading(false);
      }
    );
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #ff4e50, #f9d423)",
      }}
    >
      <div
        className="card shadow-lg p-5 text-center border-0"
        style={{
          maxWidth: "500px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="text-danger mb-4">
          <AlertTriangle size={80} />
        </div>
        <h2 className="fw-bold mb-3 text-danger">Emergency SOS</h2>
        <p className="text-muted mb-4">
          Press the button below to send an immediate alert to police and your
          emergency contacts with your live location.
        </p>

        <button
          onClick={sendSOS}
          disabled={loading}
          className="btn btn-danger btn-lg px-5 py-3 rounded-pill shadow-lg pulse"
          style={{ fontSize: "1.2rem" }}
        >
          {loading ? (
            <>
              <Loader2 className="me-2 spin" size={20} /> Sending...
            </>
          ) : (
            "🚨 Send SOS Alert"
          )}
        </button>
      </div>

      {/* Custom CSS for animations */}
      <style>
        {`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .pulse {
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default EmergencyButton;


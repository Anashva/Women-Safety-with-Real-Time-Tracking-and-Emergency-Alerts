import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:8080/api/alerts/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token"); 
          navigate("/login");
          return;
        }

        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [navigate]);
useEffect(() => {
    const userId = localStorage.getItem("userId"); 
    if (!userId) return;

    const socket = io("http://localhost:8080");

   
    socket.emit("joinUser", userId);

    socket.on("alertAcknowledged", (data) => {
      toast.success(data.message, { position: "top-right" });
    });

    socket.on("alertStatusUpdate", ({ alertId, status }) => {
      setAlerts((prev) =>
        prev.map((a) => (a._id === alertId ? { ...a, status } : a))
      );
    });

    return () => socket.disconnect();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading alerts...</p>;

  return (
    <div className="container mt-5">
      <button onClick={() => navigate("/dashboard")} className="btn btn-danger mb-4">
        Back to Dashboard
      </button>

      <h2 className="mb-4 text-center">📜 Alert History</h2>
      {alerts.length === 0 ? (
        <p className="text-center">No alerts found.</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Message</th>
              <th>Location</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <tr key={alert._id}>
                <td>{index + 1}</td>
                <td>{alert.evidence?.message || "No message"}</td>
                <td>
  {alert.location?.coordinates ? (
    <Link
      to={`https://www.google.com/maps?q=${alert.location.coordinates[1]},${alert.location.coordinates[0]}`}
      target="_blank"
      rel="noopener noreferrer"
    >
       View on Map
    </Link>
  ) : (
    "N/A"
  )}
</td>
<td>
  <span
    className={`badge ${
      alert.status === "resolved"
        ? "bg-success"
        : alert.status === "in-progress"
        ? "bg-warning text-dark"
        : alert.status === "pending" || alert.status === "active"
        ? "bg-danger"
        : "bg-secondary"
    }`}
  >
    {alert.status ? alert.status.charAt(0).toUpperCase() + alert.status.slice(1) : "Unknown"}
  </span>
</td>

                
                <td>{new Date(alert.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AlertHistory;
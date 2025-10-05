import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";

const socket = io("http://localhost:8080");

const PoliceDashboardPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [handledAlerts, setHandledAlerts] = useState([]);
  const [stationData, setStationData] = useState(null);
  const [showMap, setShowMap] = useState({});
  const [newAlertIds, setNewAlertIds] = useState([]);
  const alertRefs = useRef({});
  const [showHandledModal, setShowHandledModal] = useState(false);

  const token = localStorage.getItem("policeToken");

  const alertSound = () => {
    const audio = new Audio("/siren.mp3");
    audio.play().catch(() => console.log("Sound autoplay blocked"));
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/police/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStationData(res.data.station))
      .catch(console.error);

    fetch("http://localhost:8080/api/alerts/all")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data.filter((a) => !a.acknowledged));
        setHandledAlerts(data.filter((a) => a.acknowledged));
      })
      .catch(console.error);

    const stationId = localStorage.getItem("policeStationId");
    if (stationId) socket.emit("joinPolice", stationId);

    socket.on("newAlert", (alert) => {
      setAlerts((prev) => [alert, ...prev]);
      setNewAlertIds((prev) => [...prev, alert._id]);
      alertSound();
      toast.error(`🚨 SOS from ${alert.userSnapshot.fullName}`, {
        position: "top-right",
        autoClose: 8000,
      });
      setTimeout(() => {
        setNewAlertIds((prev) => prev.filter((id) => id !== alert._id));
      }, 10000);
    });

    const heartbeatInterval = setInterval(() => {
      axios
        .post(
          "http://localhost:8080/api/police/heartbeat",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch(console.error);
    }, 30000);

    return () => {
      socket.disconnect();
      clearInterval(heartbeatInterval);
    };
  }, [token]);

  const toggleMap = (id) => {
    setShowMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const acknowledgeAlert = async (id) => {
    setNewAlertIds((prev) => prev.filter((alertId) => alertId !== id));
    toast.success("✅ Alert acknowledged", { position: "bottom-right" });

    try {
      const res = await axios.post(
        `http://localhost:8080/api/alerts/acknowledge/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const ackAlert = res.data.alert;

      setAlerts((prev) => prev.filter((a) => a._id !== id));
      setHandledAlerts((prev) => [ackAlert, ...prev]);
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  return (
    <div className="container my-4">
      <ToastContainer />
      <div className="text-center mb-4">
        <h1 className="text-danger fw-bold display-4">👮 Police Dashboard</h1>
      </div>

      {stationData && (
        <div className="mb-4 p-4 border rounded shadow-sm bg-light text-center">
          <p className="mb-1"><b>Station:</b> {stationData.name}</p>
          <p className="mb-1"><b>Status:</b> {stationData.status}</p>
          <p className="mb-0">
            <b>Location:</b>{" "}
            {stationData.location?.coordinates?.join(", ")}
          </p>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-danger fw-bold">🚨 Active Alerts</h3>
        <button
          className="btn btn-outline-danger"
          onClick={() => setShowHandledModal(true)}
        >
          📜 Handled Alerts ({handledAlerts.length})
        </button>
      </div>

      {alerts.length === 0 ? (
        <p className="text-muted text-center">No active alerts yet.</p>
      ) : (
        <div className="row">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`col-md-6 mb-4 ${
                newAlertIds.includes(alert._id) ? "blink-alert" : ""
              }`}
              ref={(el) => (alertRefs.current[alert._id] = el)}
            >
              <div
                className={`card shadow-sm h-100 ${
                  newAlertIds.includes(alert._id) ? "border-4 border-danger" : ""
                }`}
              >
                <div className="card-header bg-gradient-danger text-white fw-bold text-center">
                  {alert.userSnapshot?.fullName || "Unknown User"}
                </div>
                <div className="card-body">
                  <p><b>Message:</b> {alert.evidence?.message}</p>
                  {alert.contactsSnapshot?.length > 0 && (
                    <>
                      <p><b>Contacts:</b></p>
                      <ul>
                        {alert.contactsSnapshot.map((c, idx) => (
                          <li key={idx}>
                            {c.name} — {c.phone}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <p>
                    <b>Location:</b>{" "}
                    {alert.location?.coordinates
                      ? `${alert.location.coordinates[1]}, ${alert.location.coordinates[0]}`
                      : "Not available"}
                  </p>
                  <p><b>Time:</b> {new Date(alert.createdAt).toLocaleString()}</p>

                  {alert.location?.coordinates && (
                    <button
                      className="btn btn-sm btn-outline-danger mb-2"
                      onClick={() => toggleMap(alert._id)}
                    >
                      {showMap[alert._id] ? "Hide Map" : "View on Map"}
                    </button>
                  )}

                  {showMap[alert._id] && alert.location?.coordinates && (
                    <MapContainer
                      center={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                      zoom={13}
                      style={{ height: "200px", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
                      >
                        <Popup>
                          {alert.userSnapshot.fullName} <br />
                          {alert.evidence.message}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  )}

                  <button
                    className="btn btn-success mt-2 w-100 fw-bold"
                    onClick={() => acknowledgeAlert(alert._id)}
                  >
                    ✅ Acknowledge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Handled Alerts Modal */}
      <div
        className={`modal fade ${showHandledModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: showHandledModal ? "rgba(0,0,0,0.5)" : "transparent" }}
      >
        <div className="modal-dialog modal-dialog-scrollable" role="document">
          <div className="modal-content border-0 shadow-lg rounded-3">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title fw-bold">Handled Alerts</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowHandledModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {handledAlerts.length === 0 ? (
                <p>No handled alerts yet.</p>
              ) : (
                <ul className="list-group">
                  {handledAlerts.map((a) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={a._id}>
                      <div>
                        {a.userSnapshot?.fullName} - {a.evidence?.message} <br/>
                        <small className="text-muted">{new Date(a.createdAt).toLocaleString()}</small>
                      </div>
                      <span className="badge bg-success">Acknowledged</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .blink-alert {
            animation: blink 1s step-start 0s infinite;
          }
          @keyframes blink {
            50% { border-color: #ff0000; box-shadow: 0 0 10px red; }
          }
          .bg-gradient-danger {
            background: linear-gradient(90deg, #dc3545, #ff6b6b);
          }
          .card:hover {
            transform: translateY(-5px);
            transition: transform 0.2s ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default PoliceDashboardPage;

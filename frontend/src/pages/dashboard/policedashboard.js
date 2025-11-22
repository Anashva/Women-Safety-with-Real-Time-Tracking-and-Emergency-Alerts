
import React, { useState, useEffect, useRef } from "react";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import io from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const PoliceDashboardPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [handledAlerts, setHandledAlerts] = useState([]);
  const [stationData, setStationData] = useState(null);
  const [showMap, setShowMap] = useState({});
  const [newAlertIds, setNewAlertIds] = useState([]);
  const [showHandledModal, setShowHandledModal] = useState(false);

  const socketRef = useRef(null);
  const alertAudioRef = useRef(null);
  const heartbeatRef = useRef(null);

  const token = localStorage.getItem("policeToken");
  const rawStationId = localStorage.getItem("policeStationId");

  // Robust normalize: accepts strings, JSON strings with $oid, objects, ObjectId-like
  const normalizeId = (id) => {
    if (!id && id !== 0) return "";
    // if already object with fields
    if (typeof id === "object") {
      if (id._id) return id._id.toString();
      if (id.$oid) return id.$oid.toString();
      try {
        return id.toString();
      } catch {
        return "";
      }
    }

    // if string - try JSON parse for patterns like '{"$oid":"..."}'
    if (typeof id === "string") {
      const trimmed = id.trim();
      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || trimmed.includes('"$oid"')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && (parsed.$oid || parsed._id)) {
            return (parsed.$oid || parsed._id).toString();
          }
        } catch {
          // not JSON, fallthrough
        }
      }

      // common case: raw ObjectId string
      return trimmed;
    }

    // fallback
    try {
      return id.toString();
    } catch {
      return "";
    }
  };

  // derive a single cleanId constant used everywhere
  const cleanStationId = normalizeId(rawStationId);

  // Initialize siren audio once
  useEffect(() => {
    alertAudioRef.current = new Audio("/siren.mp3");
    alertAudioRef.current.loop = true;
    return () => {
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Play/pause siren when newAlertIds changes
  useEffect(() => {
    if (!alertAudioRef.current) return;
    if (newAlertIds.length > 0) {
      alertAudioRef.current.play().catch(() => {});
    } else {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }
  }, [newAlertIds]);

  // Fetch alerts and station info (uses cleanStationId)
  const fetchAlerts = async () => {
    if (!cleanStationId) {
      console.warn("No stationId found in localStorage (policeStationId).");
      return;
    }

    try {
      // you used /api/alerts/all earlier — keep that and filter client-side
      // alternatively if you have a police-specific route use that (recommended)
      const res = await axios.get("http://localhost:8080/api/alerts/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.alerts || res.data;

      // show only alerts assigned to this station
      const active = data.filter(
        (alert) =>
          normalizeId(alert.nearestPoliceId) === cleanStationId && !alert.acknowledged
      );

      const handled = data.filter(
        (alert) => normalizeId(alert.nearestPoliceId) === cleanStationId && alert.acknowledged
      );

      setAlerts(active);
      setHandledAlerts(handled);
    } catch (err) {
      console.error("fetchAlerts error", err);
    }
  };

  useEffect(() => {
    if (!cleanStationId) {
      console.error("PoliceStationId missing or invalid in localStorage:", rawStationId);
      return;
    }

    // fetch station meta (name, status, location)
    axios
      .get("http://localhost:8080/api/police/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStationData(res.data.station))
      .catch((err) => console.error("fetch stationData error", err));

    // initial alerts
    fetchAlerts();

    // initialize socket and join room
    socketRef.current = io("http://localhost:8080", { transports: ["websocket", "polling"] });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      // join using normalized id
      socketRef.current.emit("joinPolice", cleanStationId);
      console.log("Joined police room:", cleanStationId);
    });

    // LISTENERS (keeps UI in sync with backend)
    socketRef.current.on("newAlert", (alert) => {
      // only add if this alert is for this station (defensive)
      if (normalizeId(alert.nearestPoliceId) === cleanStationId) {
        setAlerts((prev) => [alert, ...prev]);
        setNewAlertIds((prev) => [...prev, alert._id]);

        setTimeout(() => {
          setNewAlertIds((prev) => prev.filter((id) => id !== alert._id));
        }, 10000);
      }
    });

    // When backend removes alert from this (old) station's dashboard
    socketRef.current.on("alertRemoved", ({ alertId }) => {
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
    });

    // When alert is handled/resolved (acknowledged)
    socketRef.current.on("alertHandled", (updatedAlert) => {
      // remove from active and add to handled (if for this station)
      if (normalizeId(updatedAlert.nearestPoliceId) === cleanStationId) {
        setAlerts((prev) => prev.filter((a) => a._id !== updatedAlert._id));
        setHandledAlerts((prev) => [updatedAlert, ...prev]);
      } else {
        // if assigned away from this station, remove it
        setAlerts((prev) => prev.filter((a) => a._id !== updatedAlert._id));
      }
    });

    // Optional: backend may emit this when it assigns an alert to a station
    socketRef.current.on("alertAssigned", (assignedAlert) => {
      if (normalizeId(assignedAlert.nearestPoliceId) === cleanStationId) {
        setAlerts((prev) => [assignedAlert, ...prev]);
      }
    });

    // fallback: when an alert is updated (e.g., re-assigned to this station),
    socketRef.current.on("alert-updated", (updated) => {
      // replace if exists, else add if relevant
      if (normalizeId(updated.nearestPoliceId) === cleanStationId) {
        setAlerts((prev) => {
          const has = prev.find((a) => a._id === updated._id);
          if (has) return prev.map((a) => (a._id === updated._id ? updated : a));
          return [updated, ...prev];
        });
      } else {
        // removed from this station
        setAlerts((prev) => prev.filter((a) => a._id !== updated._id));
      }
    });

    // HEARTBEAT (keep station online)
    heartbeatRef.current = setInterval(() => {
      axios
        .post("http://localhost:8080/api/police/heartbeat", {}, { headers: { Authorization: `Bearer ${token}` } })
        .catch(() => {});
    }, 30000);

    // cleanup
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (socketRef.current) {
        socketRef.current.off("newAlert");
        socketRef.current.off("alertRemoved");
        socketRef.current.off("alertHandled");
        socketRef.current.off("alertAssigned");
        socketRef.current.off("alert-updated");
        socketRef.current.disconnect();
      }
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current.currentTime = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanStationId, token]); // run when stationId or token changes

  const toggleMap = (id) => setShowMap((prev) => ({ ...prev, [id]: !prev[id] }));

  const acknowledgeAlert = async (id) => {
    try {
      const res = await axios.post(
        `http://localhost:8080/api/alerts/acknowledge/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.alert;

      // remove from active
      setAlerts((prev) => prev.filter((a) => a._id !== id));

      // add to handled if returned
      if (updated) setHandledAlerts((prev) => [updated, ...prev]);
    } catch (err) {
      console.error("acknowledge error", err);
    }
  };

  return (
    <div className="container my-4">
      <ToastContainer />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-primary text-center w-100">👮 Police Dashboard</h1>
        <button className="btn btn-outline-success" onClick={() => setShowHandledModal(true)}>
          📜 Handled Alerts ({handledAlerts.length})
        </button>
      </div>

      {stationData && (
        <div className="mb-4 p-3 border rounded shadow-sm" style={{ backgroundColor: "#e9f5ff", borderColor: "#0d6efd" }}>
          <p>
            <b>Station:</b> {stationData.name}
          </p>
          <p>
            <b>Status:</b>{" "}
            <span style={{ color: stationData.status === "online" ? "#198754" : "#dc3545" }}>
              {stationData.status}
            </span>
          </p>
          <p>
            <b>Location:</b> {stationData.location?.coordinates?.join(", ")}
          </p>
          <p>
            {/* <b>Station ID:</b> <small className="text-muted">{cleanStationId}</small> */}
          </p>
        </div>
      )}

      <h3 className="mb-3 text-danger">🚨 Active Alerts</h3>

      {alerts.length === 0 ? (
        <p className="text-muted">No active alerts.</p>
      ) : (
        <div className="row">
          {alerts.map((alert) => (
            <div key={alert._id} className={`col-md-6 mb-4 ${newAlertIds.includes(alert._id) ? "blink-alert" : ""}`}>
              <div className="card shadow-sm h-100" style={{ borderColor: "#dc3545", backgroundColor: "#fff5f5" }}>
                <div className="card-header fw-bold" style={{ backgroundColor: "#b02a37", color: "#fff" }}>
                  {alert.userSnapshot?.fullName || "Unknown User"}
                </div>

                <div className="card-body">
                  <p>
                    <b>Message:</b> {alert.evidence?.message}
                  </p>
                  {alert.userSnapshot && (
                    <>
                      <p>
                        <b>Phone:</b> {alert.userSnapshot.phone || "N/A"}
                      </p>
                      <p>
                        <b>Email:</b> {alert.userSnapshot.email || "N/A"}
                      </p>
                    </>
                  )}

                  <p>
                    <b>Time:</b> {new Date(alert.createdAt).toLocaleString()}
                  </p>

                  {alert.location?.coordinates && (
                    <>
                      <button className="btn btn-sm btn-outline-primary mb-2" onClick={() => toggleMap(alert._id)}>
                        {showMap[alert._id] ? "Hide Map" : "View on Map"}
                      </button>

                      {showMap[alert._id] && (
                        <iframe
                          title={`map-${alert._id}`}
                          width="100%"
                          height="250"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://www.google.com/maps?q=${alert.location.coordinates[1]},${alert.location.coordinates[0]}&z=15&output=embed`}
                        ></iframe>
                      )}
                    </>
                  )}

                  <button className="btn btn-sm btn-danger mt-2" onClick={() => acknowledgeAlert(alert._id)}>
                    ✅ Acknowledge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showHandledModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: "#198754", color: "#fff" }}>
                <h5 className="modal-title">Handled Alerts</h5>
                <button type="button" className="btn-close btn" onClick={() => setShowHandledModal(false)} style={{ color: "#fff" }}>
                  &times;
                </button>
              </div>

              <div className="modal-body">
                {handledAlerts.length === 0 ? (
                  <p>No handled alerts yet.</p>
                ) : (
                  <ul className="list-group">
                    {handledAlerts.map((a) => (
                      <li className="list-group-item" key={a._id}>
                        {a.userSnapshot?.fullName} - {a.evidence?.message}
                        <br />
                        <small className="text-muted">{new Date(a.createdAt).toLocaleString()}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .blink-alert {
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          50% { border-color: #ff6b6b; box-shadow: 0 0 10px #ff6b6b; }
        }
      `}</style>
    </div>
  );
};

export default PoliceDashboardPage;

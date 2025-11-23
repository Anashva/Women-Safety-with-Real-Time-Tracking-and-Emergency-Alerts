
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
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
              <th>Type</th>
              <th>Message</th>
              <th>Location</th>
              <th>Status</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {alerts.map((alert, index) => (
              <tr key={alert._id}>
                <td>{index + 1}</td>

                <td>
                  <span
                    className={`badge ${
                      alert.alertType === "video"
                        ? "bg-primary"
                        : alert.alertType === "audio"
                        ? "bg-info"
                        : "bg-secondary"
                    }`}
                  >
                    {alert.alertType ? alert.alertType.toUpperCase() : "MESSAGE"}
                  </span>
                </td>

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
                    {alert.status
                      ? alert.status.charAt(0).toUpperCase() + alert.status.slice(1)
                      : "Unknown"}
                  </span>
                  {alert.acknowledged && (
                    <div className="text-success small mt-1">
                      ✅ Acknowledged
                    </div>
                  )}
                </td>

                <td>{new Date(alert.createdAt).toLocaleString()}</td>

                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL FOR VIEWING DETAILS */}
      {selectedAlert && (
        <div 
          className="modal d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedAlert(null)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  Alert Details - {selectedAlert.alertType?.toUpperCase() || 'MESSAGE'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedAlert(null)}
                />
              </div>
              <div className="modal-body">
                <p><b>Message:</b> {selectedAlert.evidence?.message}</p>
                <p><b>Time:</b> {new Date(selectedAlert.createdAt).toLocaleString()}</p>
                <p>
                  <b>Status:</b> 
                  <span className={`badge ms-2 ${
                    selectedAlert.status === "resolved" ? "bg-success" :
                    selectedAlert.status === "in-progress" ? "bg-warning text-dark" :
                    "bg-danger"
                  }`}>
                    {selectedAlert.status}
                  </span>
                </p>

                {/* ACKNOWLEDGMENT STATUS */}
                {selectedAlert.acknowledged ? (
                  <div className="alert alert-success">
                    <b>✅ Alert Acknowledged by Police</b>
                    <p className="mb-0 small mt-2">
                      Your emergency alert has been received and acknowledged by authorities.
                    </p>
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    <b>⏳ Waiting for Police Acknowledgment</b>
                  </div>
                )}

                {/* VIDEO DISPLAY */}
                {selectedAlert.evidence?.videoUrl && (
                  <div className="mb-3">
                    <b>🎥 Video Evidence:</b>
                    <video 
                      controls 
                      preload="auto"
                      playsInline
                      style={{ 
                        width: '100%', 
                        maxHeight: '400px', 
                        borderRadius: '8px', 
                        marginTop: '10px',
                        backgroundColor: '#000'
                      }}
                      src={`http://localhost:8080${selectedAlert.evidence.videoUrl}`}
                    >
                      <source 
                        src={`http://localhost:8080${selectedAlert.evidence.videoUrl}`} 
                        type="video/webm"
                      />
                      Your browser does not support video playback.
                    </video>
                    <div className="mt-2">
                      <a 
                        href={`http://localhost:8080${selectedAlert.evidence.videoUrl}`}
                        download
                        className="btn btn-sm btn-outline-primary"
                      >
                        📥 Download Video
                      </a>
                    </div>
                  </div>
                )}

                {/* AUDIO DISPLAY */}
                {selectedAlert.evidence?.audioUrl && (
                  <div className="mb-3">
                    <b>🎤 Audio Evidence:</b>
                    <audio 
                      controls 
                      preload="auto"
                      style={{ width: '100%', marginTop: '10px' }}
                      src={`http://localhost:8080${selectedAlert.evidence.audioUrl}`}
                    >
                      <source 
                        src={`http://localhost:8080${selectedAlert.evidence.audioUrl}`} 
                        type="audio/webm"
                      />
                      Your browser does not support audio playback.
                    </audio>
                    <div className="mt-2">
                      <a 
                        href={`http://localhost:8080${selectedAlert.evidence.audioUrl}`}
                        download
                        className="btn btn-sm btn-outline-primary"
                      >
                        📥 Download Audio
                      </a>
                    </div>
                  </div>
                )}

                {/* LOCATION */}
                {selectedAlert.location?.coordinates && (
                  <div className="mb-3">
                    <b>📍 Location:</b>
                    <p className="mb-2">
                      Lat: {selectedAlert.location.coordinates[1].toFixed(6)}, 
                      Long: {selectedAlert.location.coordinates[0].toFixed(6)}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${selectedAlert.location.coordinates[1]},${selectedAlert.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      🗺️ Open in Google Maps
                    </a>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAlert(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertHistory;
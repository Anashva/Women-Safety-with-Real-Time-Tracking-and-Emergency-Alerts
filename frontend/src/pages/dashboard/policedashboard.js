// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import io from "socket.io-client";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { BellRing, MapPin, User, CheckCircle, AlertTriangle, DownloadCloud } from "lucide-react";
// import "../../App.css";

// const mockUnits = [
//   { id: "U1", name: "Unit 1", coords: [28.7041, 77.1025], status: "available", battery: 86 },
//   { id: "U2", name: "Unit 2", coords: [28.709, 77.12], status: "on-duty", battery: 54 },
//   { id: "U3", name: "Unit 3", coords: [28.695, 77.09], status: "available", battery: 72 },
// ];

// const cameraPlaceholder = "/mnt/data/0d390afa-80bf-4cdb-bf02-985cc49be33d.png";

// const PoliceDashboardPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [handledAlerts, setHandledAlerts] = useState([]);
//   const [stationData, setStationData] = useState(null);
//   const [showMap, setShowMap] = useState({});
//   const [newAlertIds, setNewAlertIds] = useState([]);
//   const [showHandledModal, setShowHandledModal] = useState(false);

//   const [selectedAlert, setSelectedAlert] = useState(null);
//   const [aiSummary, setAiSummary] = useState("");
//   const [predictedRoute, setPredictedRoute] = useState(null);
//   const [showCamera, setShowCamera] = useState(false);

//   const socketRef = useRef(null);
//   const token = localStorage.getItem("policeToken");

//   const alertSound = () => {
//     const audio = new Audio("/siren.mp3");
//     audio.play().catch(() => {});
//   };

//   useEffect(() => {
//     axios
//       .get("http://localhost:8080/api/police/dashboard", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setStationData(res.data.station))
//       .catch((err) => console.error(err));

//     axios
//       .get("http://localhost:8080/api/alerts/all", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => {
//         const data = res.data;
//         setAlerts(data.filter((a) => !a.acknowledged));
//         setHandledAlerts(data.filter((a) => a.acknowledged));
//       })
//       .catch((err) => console.error(err));

//     socketRef.current = io("http://localhost:8080", { auth: { token } });

//     const stationId = localStorage.getItem("policeStationId");
//     if (stationId) socketRef.current.emit("joinPolice", stationId);

//     socketRef.current.on("newAlert", (alert) => {
//       setAlerts((prev) => [alert, ...prev]);
//       setNewAlertIds((prev) => [...prev, alert._id]);
//       alertSound();
//       toast.error(`🚨 SOS from ${alert.userSnapshot.fullName}`, {
//         position: "top-right",
//         autoClose: 8000,
//       });
//       setTimeout(() => {
//         setNewAlertIds((prev) => prev.filter((id) => id !== alert._id));
//       }, 10000);
//     });

//     const heartbeatInterval = setInterval(() => {
//       axios
//         .post(
//           "http://localhost:8080/api/police/heartbeat",
//           {},
//           { headers: { Authorization: `Bearer ${token}` } }
//         )
//         .catch(() => {});
//     }, 30000);

//     return () => {
//       clearInterval(heartbeatInterval);
//       if (socketRef.current) socketRef.current.disconnect();
//     };
//   }, [token]);

//   const toggleMap = (id) => setShowMap((prev) => ({ ...prev, [id]: !prev[id] }));

//   const acknowledgeAlert = async (id) => {
//     setNewAlertIds((prev) => prev.filter((alertId) => alertId !== id));
//     toast.success("✅ Alert acknowledged", { position: "bottom-right" });
//     try {
//       const res = await axios.post(
//         `http://localhost:8080/api/alerts/acknowledge/${id}`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const ackAlert = res.data.alert;
//       setAlerts((prev) => prev.filter((a) => a._id !== id));
//       setHandledAlerts((prev) => [ackAlert, ...prev]);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const generateAiSummary = (alert) => {
//     if (!alert) return "";
//     const msg = (alert.evidence?.message || "").toLowerCase();
//     const parts = [];
//     if (msg.includes("fire")) parts.push("Possible fire reported");
//     if (msg.includes("accident")) parts.push("Vehicle accident likely");
//     if (msg.includes("attack") || msg.includes("assault") || msg.includes("stab") || msg.includes("knife"))
//       parts.push("Possible violent attack — caution advised");
//     if (msg.includes("help") || msg.includes("sos")) parts.push("Immediate assistance recommended");
//     if (alert.alertType === "video") parts.push("Video evidence available");
//     if (alert.alertType === "audio") parts.push("Audio evidence available");
//     if (parts.length === 0) parts.push("No obvious critical keywords — review media if available");
//     const confidence = Math.min(95, 45 + parts.length * 15);
//     return `${parts.join(". ")}. (Summary confidence ${confidence}%)`;
//   };

//   const predictPatrolRoute = (alert) => {
//     if (!alert || !alert.location?.coordinates) return null;
//     const alertLatLng = [alert.location.coordinates[1], alert.location.coordinates[0]];
//     let best = null;
//     let bestDist = Infinity;
//     for (const u of mockUnits) {
//       const dLat = u.coords[0] - alertLatLng[0];
//       const dLng = u.coords[1] - alertLatLng[1];
//       const d = Math.sqrt(dLat * dLat + dLng * dLng);
//       if (d < bestDist) {
//         best = u;
//         bestDist = d;
//       }
//     }
//     if (!best) return null;
//     return { unit: best, route: [best.coords, alertLatLng] };
//   };

//   const handleShowAiSummary = (alert) => {
//     setAiSummary(generateAiSummary(alert));
//     setSelectedAlert(alert);
//     setShowCamera(false);
//     window.scrollTo({ top: 150, behavior: "smooth" });
//   };

//   const handlePredictRoute = (alert) => {
//     const pr = predictPatrolRoute(alert);
//     setPredictedRoute(pr);
//     setSelectedAlert(alert);
//     if (alert?._id) setShowMap((prev) => ({ ...prev, [alert._id]: true }));
//     if (pr) toast.info(`Suggested unit: ${pr.unit.name} (mock estimate)`, { autoClose: 4000 });
//     else toast.info("No unit suggestion available", { autoClose: 3000 });
//   };

//   const handleToggleCamera = (alert) => {
//     setSelectedAlert(alert);
//     setShowCamera((s) => !s);
//     if (alert?._id) setShowMap((prev) => ({ ...prev, [alert._id]: true }));
//   };

//   const defaultCenter = stationData?.location?.coordinates?.length >= 2
//     ? [stationData.location.coordinates[1], stationData.location.coordinates[0]]
//     : [28.7041, 77.1025];

//   return (
//     <div className="dashboard-bg" style={{ position: "relative" }}>
//       <div className="container my-4">
//         <ToastContainer />
//         {/* Header */}
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <div className="d-flex align-items-center gap-3">
//             <div className="p-3 station-box d-flex flex-column align-items-start">
//               <div className="d-flex align-items-center gap-2 mb-2">
//                 <MapPin size={18} />
//                 <strong>Station</strong>
//               </div>
//               <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>
//                 {stationData?.name || "—"}
//               </div>
//               <div className="mt-2 small text-muted">
//                 {stationData?.address
//                   ? stationData.address
//                   : stationData?.location?.coordinates?.length >= 2
//                   ? `${stationData.location.coordinates[1]}, ${stationData.location.coordinates[0]}`
//                   : "Location not set"}
//               </div>
//               <div className="mt-2">
//                 <span className="badge bg-light text-dark">Status: </span>
//                 <span className="ms-2" style={{ color: stationData?.status === "online" ? "#198754" : "#dc3545" }}>
//                   {stationData?.status || "unknown"}
//                 </span>
//               </div>
//             </div>

//             <div className="p-3 ms-2 station-stats d-flex flex-column justify-content-center">
//               <div className="d-flex align-items-center gap-2">
//                 <BellRing />
//                 <div>
//                   <div className="small text-muted">Active Alerts</div>
//                   <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{alerts.length}</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="text-end">
//             <h1 className="dashboard-title mb-0">👮 Police Dashboard</h1>
//             <div className="mt-2">
//               <button className="btn btn-custom-primary me-2" onClick={() => setShowHandledModal(true)}>
//                 <User size={16} className="me-1" /> Handled Alerts <span className="badge bg-white text-dark ms-2">{handledAlerts.length}</span>
//               </button>
//               <button className="btn btn-outline-secondary" onClick={() => window.location.reload()} title="Refresh">⟳</button>
//             </div>
//           </div>
//         </div>

//         {/* Quick Stats */}
//         <div className="row mb-3">
//           {["Total Alerts", "Critical Alerts", "Unresolved", "Handled"].map((title, idx) => {
//             const value = title === "Total Alerts" ? alerts.length + handledAlerts.length
//               : title === "Critical Alerts" ? alerts.filter(a => a.severity === "high").length
//               : title === "Unresolved" ? alerts.length
//               : handledAlerts.length;
//             return (
//               <div className="col-md-3" key={idx}>
//                 <div className="card p-3 text-center shadow-sm">
//                   <div className="small text-muted">{title}</div>
//                   <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Active Alerts */}
//         <h3 className="mb-3 text-danger">🚨 Active Alerts</h3>
//         {alerts.length === 0 ? <p className="text-muted">No active alerts yet.</p> : (
//           <div className="row">
//             {alerts.map((alert) => (
//               <div key={alert._id} className={`col-md-6 mb-4 ${newAlertIds.includes(alert._id) ? "blink-alert" : ""}`}>
//                 <div className={`card active-alert-card shadow-lg h-100 ${newAlertIds.includes(alert._id) ? "blink-alert" : ""}`}>
//                   <div className="card-header d-flex justify-content-between align-items-center">
//                     <div className="fw-bold d-flex align-items-center gap-2">
//                       <AlertTriangle size={16} /> {alert.userSnapshot?.fullName || "Unknown User"}
//                     </div>
//                     <div>
//                       <span className={`badge badge-alert-type ${alert.alertType === "video" ? "bg-primary" : alert.alertType === "audio" ? "bg-info text-dark" : "bg-secondary text-white"}`}>
//                         {alert.alertType ? alert.alertType.toUpperCase() : "MESSAGE"}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="card-body">
//                     <p><b>Message:</b> {alert.evidence?.message}</p>

//                     {alert.evidence?.videoUrl && (
//                       <div className="mb-3">
//                         <video controls preload="auto" playsInline style={{ width: '100%', maxHeight: '250px', borderRadius: '8px', backgroundColor: '#000' }}>
//                           <source src={`http://localhost:8080${alert.evidence.videoUrl}`} type="video/webm" />
//                         </video>
//                         <div className="mt-2 d-flex gap-2">
//                           <a href={`http://localhost:8080${alert.evidence.videoUrl}`} download className="btn btn-sm btn-outline-primary">
//                             <DownloadCloud size={14} className="me-1" /> Download Video
//                           </a>
//                         </div>
//                       </div>
//                     )}

//                     {alert.evidence?.audioUrl && (
//                       <div className="mb-3">
//                         <audio controls preload="auto" style={{ width: '100%' }}>
//                           <source src={`http://localhost:8080${alert.evidence.audioUrl}`} type="audio/webm" />
//                         </audio>
//                       </div>
//                     )}

//                     <p><b>Phone:</b> {alert.userSnapshot?.phone || "N/A"}</p>
//                     <p><b>Email:</b> {alert.userSnapshot?.email || "N/A"}</p>
//                     {alert.contactsSnapshot?.length > 0 && (
//                       <>
//                         <p><b>Emergency Contacts:</b></p>
//                         <ul>{alert.contactsSnapshot.map((c, idx) => <li key={idx}>{c.name} — {c.phone}</li>)}</ul>
//                       </>
//                     )}

//                     <p><b>Location:</b> {alert.location?.coordinates ? `${alert.location.coordinates[1]}, ${alert.location.coordinates[0]}` : "Not available"}</p>
//                     <p><b>Time:</b> {new Date(alert.createdAt).toLocaleString()}</p>

//                     {alert.location?.coordinates && (
//                       <button className="btn btn-sm btn-outline-primary mb-2 me-2" onClick={() => toggleMap(alert._id)}>
//                         {showMap[alert._id] ? "Hide Map" : "View on Map"}
//                       </button>
//                     )}

//                     {/* AI Summary / Predict / Camera */}
//                     <div className="mb-2">
//                       <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleShowAiSummary(alert)}>🧠 AI Summary</button>
//                       <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handlePredictRoute(alert)}>🗺 Predict Route</button>
//                       {alert.alertType === "video" && (
//                         <button className="btn btn-sm btn-outline-info" onClick={() => handleToggleCamera(alert)}>🎥 Camera</button>
//                       )}
//                     </div>

//                     {selectedAlert?._id === alert._id && aiSummary && (
//                       <div className="card p-3 mb-2" style={{ background: "#f8fafc" }}>
//                         <div style={{ fontWeight: 700 }}>AI Incident Summary</div>
//                         <div className="small text-muted mt-1">{aiSummary}</div>
//                       </div>
//                     )}

//                     {selectedAlert?._id === alert._id && showCamera && (
//                       <div className="card p-2 mb-2">
//                         <div style={{ fontWeight: 700 }} className="mb-1">Live Camera Stream</div>
//                         <video controls style={{ width: "100%", borderRadius: 8 }}>
//                           <source src={`http://localhost:8080${alert.evidence.videoUrl}`} type="video/webm" />
//                         </video>
//                         <div className="small text-muted mt-1">UI-only camera panel (mock stream)</div>
//                       </div>
//                     )}

//                     {showMap[alert._id] && alert.location?.coordinates && (
//                       <MapContainer center={[alert.location.coordinates[1], alert.location.coordinates[0]]} zoom={13} style={{ height: "200px", width: "100%" }}>
//                         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                         <Marker position={[alert.location.coordinates[1], alert.location.coordinates[0]]}>
//                           <Popup>{alert.userSnapshot.fullName}<br/>{alert.evidence.message}</Popup>
//                         </Marker>
//                         {predictedRoute && selectedAlert?._id === alert._id && predictedRoute.route && (
//                           <Polyline positions={predictedRoute.route} pathOptions={{ color: "orange", weight: 4, dashArray: "6" }} />
//                         )}
//                       </MapContainer>
//                     )}

//                     <div className="d-flex justify-content-between align-items-center mt-3">
//                       <div>
//                         {alert.acknowledged ? (
//                           <div className="ack-box mt-1 p-3 text-center">
//                             <CheckCircle size={24} className="text-success mb-1" />
//                             <div style={{ fontWeight: 700, color: "#198754" }}>Alert Resolved</div>
//                             <div className="small text-muted">Acknowledged by station</div>
//                           </div>
//                         ) : (
//                           <span className="text-danger small"><AlertTriangle size={14} /> Awaiting Ack</span>
//                         )}
//                       </div>

//                       <div>
//                         {!alert.acknowledged && (
//                           <button className="btn btn-sm btn-custom-danger me-2" onClick={() => acknowledgeAlert(alert._id)}>✅ Acknowledge</button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Handled Alerts Modal */}
//         {/* {showHandledModal && (
//           <div className="handled-modal">
//             <div className="modal-content p-3">
//               <div className="d-flex justify-content-between align-items-center mb-2">
//                 <h5>✅ Handled Alerts</h5>
//                 <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowHandledModal(false)}>Close</button>
//               </div>
//               {handledAlerts.length === 0 ? <p className="text-muted">No handled alerts.</p> : (
//                 <div className="timeline-list">
//                   {handledAlerts.map((h, idx) => (
//                     <div key={idx} className="timeline-item">
//                       <span className={`badge ${h.alertType === "video" ? "bg-primary" : h.alertType === "audio" ? "bg-info text-dark" : "bg-secondary text-white"} me-2`}>{h.alertType?.toUpperCase() || 'MESSAGE'}</span>
//                       <strong>{h.userSnapshot?.fullName}</strong> — {h.evidence?.message?.slice(0, 50)}
//                       <div className="small text-muted">{new Date(h.createdAt).toLocaleTimeString()}</div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )} */}
//         {/* Handled Alerts Modal */}
// {showHandledModal && (
//   <div className="handled-modal">
//     <div className="modal-content p-3">
//       <div className="d-flex justify-content-between align-items-center mb-2">
//         <h5>✅ Handled Alerts</h5>
//         <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowHandledModal(false)}>Close</button>
//       </div>
//       {handledAlerts.length === 0 ? (
//         <p className="text-muted">No handled alerts.</p>
//       ) : (
//         <div className="timeline-list">
//           {handledAlerts.map((a) => (
//             <div key={a._id} className="timeline-item d-flex flex-column gap-2 mb-2 p-2 rounded shadow-sm"
//                  style={{ background: a.acknowledged ? "#e9f7ef" : "#fff5f5" }}>
//               <div>
//                 <span className={`badge ${a.alertType === "video" ? "bg-primary" : a.alertType === "audio" ? "bg-info text-dark" : "bg-secondary text-white"} me-2`}>
//                   {a.alertType?.toUpperCase() || "MESSAGE"}
//                 </span>
//                 <strong>{a.userSnapshot?.fullName}</strong>
//                 <div className="small text-muted">{a.evidence?.message || "No message"}</div>
//                 <div className="small text-muted">{new Date(a.createdAt).toLocaleString()}</div>
//               </div>

//               {/* Video/Audio handling */}
//               {a.evidence?.videoUrl && (
//                 <div className="mb-1">
//                   <video controls preload="auto" style={{ width: '100%', borderRadius: 6 }}>
//                     <source src={`http://localhost:8080${a.evidence.videoUrl}`} type="video/webm" />
//                   </video>
//                   <a href={`http://localhost:8080${a.evidence.videoUrl}`} download className="btn btn-sm btn-outline-primary mt-1">
//                     <DownloadCloud size={14} className="me-1" /> Download Video
//                   </a>
//                 </div>
//               )}

//               {a.evidence?.audioUrl && (
//                 <div className="mb-1">
//                   <audio controls preload="auto" style={{ width: '100%' }}>
//                     <source src={`http://localhost:8080${a.evidence.audioUrl}`} type="audio/webm" />
//                   </audio>
//                   <a href={`http://localhost:8080${a.evidence.audioUrl}`} download className="btn btn-sm btn-outline-primary mt-1">
//                     <DownloadCloud size={14} className="me-1" /> Download Audio
//                   </a>
//                 </div>
//               )}

//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   </div>
// )}

//       </div>
//       {/* Custom CSS */}
//       <style>{`
//         .dashboard-bg { background: #f1f5f9; min-height: 100vh; }
//         .station-box, .station-stats { background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 15px; }
//         .btn-custom-primary { background: #0d6efd; color: white; }
//         .btn-custom-primary:hover { background: #0b5ed7; }
//         .btn-custom-danger { background: #dc3545; color: white; }
//         .btn-custom-danger:hover { background: #bb2d3b; }
//         .active-alert-card { border-left: 4px solid #dc3545; }
//         .blink-alert { animation: blink 1.2s infinite; }
//         @keyframes blink { 0%,50%,100%{opacity:1}25%,75%{opacity:0.5} }
//         .timeline-list { max-height: 300px; overflow-y: auto; padding-right: 5px; }
//         .timeline-item { padding: 6px 10px; border-bottom: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 5px; transition: all 0.3s; }
//         .handled-modal { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; z-index:9999; }
//         .handled-modal .modal-content { background: #fff; border-radius: 10px; max-width: 600px; width: 90%; max-height: 80%; overflow-y: auto; }
//         .badge-alert-type { font-size: 0.7rem; }
//       `}</style>
//     </div>
//   );
// };

// export default PoliceDashboardPage;








// ...existing code...
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BellRing, MapPin, User, CheckCircle, AlertTriangle, DownloadCloud, RefreshCw, Camera } from "lucide-react";
import "../../App.css"; // optional - you can keep inline styles below

// --- Mock nearby units (used for simple nearest-unit suggestion) ---
const mockUnits = [
  { id: "U1", name: "Unit 1", coords: [28.7041, 77.1025], status: "available", battery: 86 },
  { id: "U2", name: "Unit 2", coords: [28.709, 77.12], status: "on-duty", battery: 54 },
  { id: "U3", name: "Unit 3", coords: [28.695, 77.09], status: "available", battery: 72 },
];

const BASE = "http://localhost:8080";

const PoliceDashboardPage = () => {
  // data
  const [alerts, setAlerts] = useState([]);
  const [handledAlerts, setHandledAlerts] = useState([]);
  const [stationData, setStationData] = useState(null);

  // UI
  const [showMap, setShowMap] = useState({});
  const [newAlertIds, setNewAlertIds] = useState([]);
  const [showHandledModal, setShowHandledModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [predictedRoute, setPredictedRoute] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  // refs
  const socketRef = useRef(null);
  const alertAudioRef = useRef(null);
  const heartbeatRef = useRef(null);

  // auth/station
  const token = localStorage.getItem("policeToken");
  const rawStationId = localStorage.getItem("policeStationId");

  // Normalize ids (handles ObjectId, {$oid:...}, raw strings)
  const normalizeId = (id) => {
    if (id === null || id === undefined) return "";
    if (typeof id === "object") {
      if (id._id) return String(id._id);
      if (id.$oid) return String(id.$oid);
      try { return String(id); } catch { return ""; }
    }
    if (typeof id === "string") {
      const t = id.trim();
      if ((t.startsWith("{") && t.endsWith("}")) || t.includes('"$oid"')) {
        try {
          const parsed = JSON.parse(t);
          if (parsed && (parsed.$oid || parsed._id)) return String(parsed.$oid || parsed._id);
        } catch {}
      }
      return t;
    }
    try { return String(id); } catch { return ""; }
  };

  const cleanStationId = normalizeId(rawStationId);

  // Initialize shared siren audio (looped)
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

  // Play/pause siren based on newAlertIds
  useEffect(() => {
    if (!alertAudioRef.current) return;
    if (newAlertIds.length > 0) {
      alertAudioRef.current.play().catch(() => {});
    } else {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }
  }, [newAlertIds]);

  // Fetch station data + alerts, and init socket + heartbeat
  useEffect(() => {
    // station meta
    axios.get(`${BASE}/api/police/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStationData(res.data.station))
      .catch(err => console.warn("station fetch failed", err));

    // initial alerts
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${BASE}/api/alerts/all`, { headers: { Authorization: `Bearer ${token}` } });
        const data = Array.isArray(res.data) ? res.data : res.data.alerts || res.data;
        if (cleanStationId) {
          setAlerts(data.filter(a => normalizeId(a.nearestPoliceId) === cleanStationId && !a.acknowledged));
          setHandledAlerts(data.filter(a => normalizeId(a.nearestPoliceId) === cleanStationId && a.acknowledged));
        } else {
          setAlerts(data.filter(a => !a.acknowledged));
          setHandledAlerts(data.filter(a => a.acknowledged));
        }
      } catch (err) {
        console.error("fetchAlerts error", err);
      }
    };
    fetchAlerts();

    // sockets
    socketRef.current = io(BASE, { transports: ["websocket", "polling"], auth: { token } });
    socketRef.current.on("connect", () => {
      if (cleanStationId) socketRef.current.emit("joinPolice", cleanStationId);
    });

    socketRef.current.on("newAlert", (alert) => {
      if (!cleanStationId || normalizeId(alert.nearestPoliceId) === cleanStationId) {
        setAlerts(prev => [alert, ...prev]);
        setNewAlertIds(prev => [...prev, alert._id]);
        toast.error(`🚨 SOS from ${alert.userSnapshot?.fullName || "Unknown"}`, { autoClose: 7000 });
        setTimeout(() => setNewAlertIds(prev => prev.filter(id => id !== alert._id)), 10000);
      }
    });

    socketRef.current.on("alertRemoved", ({ alertId }) => {
      setAlerts(prev => prev.filter(a => a._id !== alertId));
    });

    socketRef.current.on("alertHandled", (updatedAlert) => {
      if (!cleanStationId || normalizeId(updatedAlert.nearestPoliceId) === cleanStationId) {
        setAlerts(prev => prev.filter(a => a._id !== updatedAlert._id));
        setHandledAlerts(prev => [updatedAlert, ...prev]);
      } else {
        setAlerts(prev => prev.filter(a => a._id !== updatedAlert._id));
      }
    });

    socketRef.current.on("alertAssigned", (assignedAlert) => {
      if (!cleanStationId || normalizeId(assignedAlert.nearestPoliceId) === cleanStationId) {
        setAlerts(prev => [assignedAlert, ...prev]);
      }
    });

    socketRef.current.on("alert-updated", (updated) => {
      if (!cleanStationId || normalizeId(updated.nearestPoliceId) === cleanStationId) {
        setAlerts(prev => {
          const has = prev.find(a => a._id === updated._id);
          if (has) return prev.map(a => (a._id === updated._id ? updated : a));
          return [updated, ...prev];
        });
      } else {
        setAlerts(prev => prev.filter(a => a._id !== updated._id));
      }
    });

    // heartbeat
    heartbeatRef.current = setInterval(() => {
      axios.post(`${BASE}/api/police/heartbeat`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }, 30000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (socketRef.current) {
        socketRef.current.off();
        socketRef.current.disconnect();
      }
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current.currentTime = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanStationId, token]);

  // UI helpers
  const toggleMap = (id) => setShowMap(prev => ({ ...prev, [id]: !prev[id] }));

  const acknowledgeAlert = async (id) => {
    try {
      const res = await axios.post(`${BASE}/api/alerts/acknowledge/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const updated = res.data.alert;
      setAlerts(prev => prev.filter(a => a._id !== id));
      if (updated) setHandledAlerts(prev => [updated, ...prev]);
      toast.success("✅ Alert acknowledged");
      setNewAlertIds(prev => prev.filter(x => x !== id));
    } catch (err) {
      console.error("acknowledge error", err);
      toast.error("Failed to acknowledge");
    }
  };

  // Simple AI summary (local heuristic)
  const generateAiSummary = (alert) => {
    if (!alert) return "";
    const msg = (alert.evidence?.message || "").toLowerCase();
    const parts = [];
    if (msg.includes("fire")) parts.push("Possible fire reported");
    if (msg.includes("accident")) parts.push("Vehicle accident likely");
    if (msg.includes("attack") || msg.includes("assault") || msg.includes("stab") || msg.includes("knife"))
      parts.push("Possible violent attack — caution advised");
    if (msg.includes("help") || msg.includes("sos")) parts.push("Immediate assistance recommended");
    if (alert.alertType === "video") parts.push("Video evidence available");
    if (alert.alertType === "audio") parts.push("Audio evidence available");
    if (parts.length === 0) parts.push("No obvious critical keywords — review media if available");
    const confidence = Math.min(95, 45 + parts.length * 15);
    return `${parts.join(". ")}. (Confidence ${confidence}%)`;
  };

  // Predict nearest unit (mock)
  const predictPatrolRoute = (alert) => {
    if (!alert?.location?.coordinates) return null;
    const alertLatLng = [alert.location.coordinates[1], alert.location.coordinates[0]];
    let best = null;
    let bestDist = Infinity;
    for (const u of mockUnits) {
      const dLat = u.coords[0] - alertLatLng[0];
      const dLng = u.coords[1] - alertLatLng[1];
      const d = Math.sqrt(dLat * dLat + dLng * dLng);
      if (d < bestDist) { best = u; bestDist = d; }
    }
    if (!best) return null;
    return { unit: best, route: [best.coords, alertLatLng] };
  };

  const handleShowAiSummary = (alert) => {
    setAiSummary(generateAiSummary(alert));
    setSelectedAlert(alert);
    setShowCamera(false);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const handlePredictRoute = (alert) => {
    const pr = predictPatrolRoute(alert);
    setPredictedRoute(pr);
    setSelectedAlert(alert);
    if (alert?._id) setShowMap(prev => ({ ...prev, [alert._id]: true }));
    if (pr) toast.info(`Suggested unit: ${pr.unit.name} (mock estimate)`, { autoClose: 4000 });
    else toast.info("No unit suggestion available", { autoClose: 3000 });
  };

  const handleToggleCamera = (alert) => {
    setSelectedAlert(alert);
    setShowCamera(s => !s);
    if (alert?._id) setShowMap(prev => ({ ...prev, [alert._id]: true }));
  };

  // default map center
  const defaultCenter = stationData?.location?.coordinates?.length >= 2
    ? [stationData.location.coordinates[1], stationData.location.coordinates[0]]
    : [28.7041, 77.1025];

  return (
    <div className="dashboard-bg" style={{ minHeight: "100vh", paddingBottom: 40 }}>
      <div className="container my-4">
        <ToastContainer />
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 station-box d-flex flex-column align-items-start">
              <div className="d-flex align-items-center gap-2 mb-2"><MapPin size={18} /><strong>Station</strong></div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{stationData?.name || "—"}</div>
              <div className="mt-2 small text-muted">
                {stationData?.address
                  ? stationData.address
                  : stationData?.location?.coordinates?.length >= 2
                    ? `${stationData.location.coordinates[1]}, ${stationData.location.coordinates[0]}`
                    : "Location not set"}
              </div>
              <div className="mt-2">
                <span className="badge bg-light text-dark">Status: </span>
                <span className="ms-2" style={{ color: stationData?.status === "online" ? "#198754" : "#dc3545" }}>
                  {stationData?.status || "unknown"}
                </span>
              </div>
            </div>

            <div className="p-3 ms-2 station-stats d-flex flex-column justify-content-center">
              <div className="d-flex align-items-center gap-2">
                <BellRing />
                <div>
                  <div className="small text-muted">Active Alerts</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{alerts.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-end">
            <h1 className="dashboard-title mb-0">👮 Police Dashboard</h1>
            <div className="mt-2">
              <button className="btn btn-custom-primary me-2" onClick={() => setShowHandledModal(true)}>
                <User size={16} className="me-1" /> Handled Alerts <span className="badge bg-white text-dark ms-2">{handledAlerts.length}</span>
              </button>
              <button className="btn btn-outline-secondary" onClick={() => window.location.reload()} title="Refresh"><RefreshCw size={16} /></button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row mb-3">
          {["Total Alerts", "Critical Alerts", "Unresolved", "Handled"].map((title, idx) => {
            const value = title === "Total Alerts" ? alerts.length + handledAlerts.length
              : title === "Critical Alerts" ? alerts.filter(a => a.severity === "high").length
              : title === "Unresolved" ? alerts.length
              : handledAlerts.length;
            return (
              <div className="col-md-3" key={idx}>
                <div className="card p-3 text-center shadow-sm">
                  <div className="small text-muted">{title}</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Alerts */}
        <h3 className="mb-3 text-danger">🚨 Active Alerts</h3>
        {alerts.length === 0 ? <p className="text-muted">No active alerts yet.</p> : (
          <div className="row">
            {alerts.map((alert) => (
              <div key={alert._id} className={`col-md-6 mb-4 ${newAlertIds.includes(alert._id) ? "blink-alert" : ""}`}>
                <div className={`card active-alert-card shadow-lg h-100 ${newAlertIds.includes(alert._id) ? "blink-alert" : ""}`}>
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div className="fw-bold d-flex align-items-center gap-2">
                      <AlertTriangle size={16} /> {alert.userSnapshot?.fullName || "Unknown User"}
                    </div>
                    <div>
                      <span className={`badge badge-alert-type ${alert.alertType === "video" ? "bg-primary" : alert.alertType === "audio" ? "bg-info text-dark" : "bg-secondary text-white"}`}>
                        {alert.alertType ? alert.alertType.toUpperCase() : "MESSAGE"}
                      </span>
                    </div>
                  </div>

                  <div className="card-body">
                    <p><b>Message:</b> {alert.evidence?.message}</p>

                    {/* Video */}
                    {alert.evidence?.videoUrl && (
                      <div className="mb-3">
                        <video controls preload="auto" playsInline style={{ width: '100%', maxHeight: '250px', borderRadius: '8px', backgroundColor: '#000' }}>
                          <source src={`${BASE}${alert.evidence.videoUrl}`} type="video/webm" />
                          Your browser does not support video playback.
                        </video>
                        <div className="mt-2 d-flex gap-2">
                          <a href={`${BASE}${alert.evidence.videoUrl}`} download className="btn btn-sm btn-outline-primary">
                            <DownloadCloud size={14} className="me-1" /> Download Video
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Audio */}
                    {alert.evidence?.audioUrl && (
                      <div className="mb-3">
                        <audio controls preload="auto" style={{ width: '100%' }}>
                          <source src={`${BASE}${alert.evidence.audioUrl}`} type="audio/webm" />
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    )}

                    <p><b>Phone:</b> {alert.userSnapshot?.phone || "N/A"}</p>
                    <p><b>Email:</b> {alert.userSnapshot?.email || "N/A"}</p>

                    {alert.contactsSnapshot?.length > 0 && (
                      <>
                        <p><b>Emergency Contacts:</b></p>
                        <ul>{alert.contactsSnapshot.map((c, idx) => <li key={idx}>{c.name} — {c.phone}</li>)}</ul>
                      </>
                    )}

                    <p><b>Location:</b> {alert.location?.coordinates ? `${alert.location.coordinates[1]}, ${alert.location.coordinates[0]}` : "Not available"}</p>
                    <p><b>Time:</b> {new Date(alert.createdAt).toLocaleString()}</p>

                    {alert.location?.coordinates && (
                      <button className="btn btn-sm btn-outline-primary mb-2 me-2" onClick={() => toggleMap(alert._id)}>
                        {showMap[alert._id] ? "Hide Map" : "View on Map"}
                      </button>
                    )}

                    {/* AI Summary / Predict / Camera */}
                    <div className="mb-2">
                      <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleShowAiSummary(alert)}>🧠 AI Summary</button>
                      <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handlePredictRoute(alert)}>🗺 Predict Route</button>
                      {alert.alertType === "video" && (
                        <button className="btn btn-sm btn-outline-info" onClick={() => handleToggleCamera(alert)}><Camera size={14} /> Camera</button>
                      )}
                    </div>

                    {selectedAlert?._id === alert._id && aiSummary && (
                      <div className="card p-3 mb-2" style={{ background: "#f8fafc" }}>
                        <div style={{ fontWeight: 700 }}>AI Incident Summary</div>
                        <div className="small text-muted mt-1">{aiSummary}</div>
                      </div>
                    )}

                    {selectedAlert?._id === alert._id && showCamera && (
                      <div className="card p-2 mb-2">
                        <div style={{ fontWeight: 700 }} className="mb-1">Live Camera Stream</div>
                        <video controls style={{ width: "100%", borderRadius: 8 }}>
                          <source src={`${BASE}${alert.evidence.videoUrl}`} type="video/webm" />
                          Your browser doesn't support video.
                        </video>
                        <div className="small text-muted mt-1">UI-only camera panel (mock stream)</div>
                      </div>
                    )}

                    {showMap[alert._id] && alert.location?.coordinates && (
                      <MapContainer center={[alert.location.coordinates[1], alert.location.coordinates[0]]} zoom={13} style={{ height: "200px", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[alert.location.coordinates[1], alert.location.coordinates[0]]}>
                          <Popup>{alert.userSnapshot?.fullName}<br/>{alert.evidence?.message}</Popup>
                        </Marker>
                        {predictedRoute && selectedAlert?._id === alert._id && predictedRoute.route && (
                          <Polyline positions={predictedRoute.route} pathOptions={{ color: "orange", weight: 4, dashArray: "6" }} />
                        )}
                      </MapContainer>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        {alert.acknowledged ? (
                          <div className="ack-box mt-1 p-3 text-center">
                            <CheckCircle size={24} className="text-success mb-1" />
                            <div style={{ fontWeight: 700, color: "#198754" }}>Alert Resolved</div>
                            <div className="small text-muted">Acknowledged by station</div>
                          </div>
                        ) : (
                          <span className="text-danger small"><AlertTriangle size={14} /> Awaiting Ack</span>
                        )}
                      </div>

                      <div>
                        {!alert.acknowledged && (
                          <button className="btn btn-sm btn-custom-danger me-2" onClick={() => acknowledgeAlert(alert._id)}>✅ Acknowledge</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Handled Alerts Modal */}
        {showHandledModal && (
          <div className="handled-modal">
            <div className="modal-content p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>✅ Handled Alerts</h5>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowHandledModal(false)}>Close</button>
              </div>
              {handledAlerts.length === 0 ? (
                <p className="text-muted">No handled alerts.</p>
              ) : (
                <div className="timeline-list">
                  {handledAlerts.map((a) => (
                    <div key={a._id} className="timeline-item d-flex flex-column gap-2 mb-2 p-2 rounded shadow-sm"
                         style={{ background: a.acknowledged ? "#e9f7ef" : "#fff5f5" }}>
                      <div>
                        <span className={`badge ${a.alertType === "video" ? "bg-primary" : a.alertType === "audio" ? "bg-info text-dark" : "bg-secondary text-white"} me-2`}>
                          {a.alertType?.toUpperCase() || "MESSAGE"}
                        </span>
                        <strong>{a.userSnapshot?.fullName}</strong>
                        <div className="small text-muted">{a.evidence?.message || "No message"}</div>
                        <div className="small text-muted">{new Date(a.createdAt).toLocaleString()}</div>
                      </div>

                      {a.evidence?.videoUrl && (
                        <div className="mb-1">
                          <video controls preload="auto" style={{ width: '100%', borderRadius: 6 }}>
                            <source src={`${BASE}${a.evidence.videoUrl}`} type="video/webm" />
                            Your browser does not support video playback.
                          </video>
                          <a href={`${BASE}${a.evidence.videoUrl}`} download className="btn btn-sm btn-outline-primary mt-1">
                            <DownloadCloud size={14} className="me-1" /> Download Video
                          </a>
                        </div>
                      )}

                      {a.evidence?.audioUrl && (
                        <div className="mb-1">
                          <audio controls preload="auto" style={{ width: '100%' }}>
                            <source src={`${BASE}${a.evidence.audioUrl}`} type="audio/webm" />
                            Your browser does not support audio playback.
                          </audio>
                          <a href={`${BASE}${a.evidence.audioUrl}`} download className="btn btn-sm btn-outline-primary mt-1">
                            <DownloadCloud size={14} className="me-1" /> Download Audio
                          </a>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Styles (in-file for convenience) */}
      <style>{`
        .dashboard-bg { background: #f1f5f9; }
        .station-box, .station-stats { background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 15px; }
        .btn-custom-primary { background: #0d6efd; color: white; }
        .btn-custom-primary:hover { background: #0b5ed7; }
        .btn-custom-danger { background: #dc3545; color: white; }
        .btn-custom-danger:hover { background: #bb2d3b; }
        .active-alert-card { border-left: 4px solid #dc3545; }
        .blink-alert { animation: blink 1.2s infinite; }
        @keyframes blink { 0%,50%,100%{opacity:1}25%,75%{opacity:0.5} }
        .timeline-list { max-height: 300px; overflow-y: auto; padding-right: 5px; }
        .timeline-item { padding: 6px 10px; border-bottom: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 5px; transition: all 0.3s; }
        .handled-modal { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; z-index:9999; }
        .handled-modal .modal-content { background: #fff; border-radius: 10px; max-width: 900px; width: 95%; max-height: 80%; overflow-y: auto; }
        .badge-alert-type { font-size: 0.7rem; }
        .ack-box { border-radius: 8px; background: #f6fffa; border: 1px solid #e6f4ea; }
      `}</style>
    </div>
  );
};

export default PoliceDashboardPage;
// ...existing code...
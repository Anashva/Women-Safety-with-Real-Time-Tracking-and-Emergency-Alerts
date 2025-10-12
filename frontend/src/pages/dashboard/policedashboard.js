// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import io from "socket.io-client";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import "bootstrap/dist/css/bootstrap.min.css";

// const socket = io("http://localhost:8080");

// const PoliceDashboardPage = () => {
//   const [alerts, setAlerts] = useState([]); // active alerts
//   const [handledAlerts, setHandledAlerts] = useState([]); // acknowledged alerts
//   const [stationData, setStationData] = useState(null);
//   const [showMap, setShowMap] = useState({});
//   const [newAlertIds, setNewAlertIds] = useState([]);
//   const alertRefs = useRef({});
//   const [showHandledModal, setShowHandledModal] = useState(false);

//   const token = localStorage.getItem("policeToken");

//   const alertSound = () => {
//     const audio = new Audio("/siren.mp3");
//     audio.play().catch(() => console.log("Sound autoplay blocked"));
//   };

//   useEffect(() => {
//     axios
//       .get("http://localhost:8080/api/police/dashboard", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setStationData(res.data.station))
//       .catch(console.error);

//     fetch("http://localhost:8080/api/alerts/all")
//       .then((res) => res.json())
//       .then((data) => {
//         setAlerts(data.filter((a) => !a.acknowledged));
//         setHandledAlerts(data.filter((a) => a.acknowledged));
//       })
//       .catch(console.error);

//     const stationId = localStorage.getItem("policeStationId");
//     if (stationId) socket.emit("joinPolice", stationId);

//     socket.on("newAlert", (alert) => {
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
//         .catch(console.error);
//     }, 30000);

//     return () => {
//       socket.disconnect();
//       clearInterval(heartbeatInterval);
//     };
//   }, [token]);

//   const toggleMap = (id) => {
//     setShowMap((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

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
//       setHandledAlerts((prev) => [ackAlert, ...prev]); // store handled alert
//     } catch (err) {
//       console.error("Error acknowledging alert:", err);
//     }
//   };

//   return (
//     <div className="container my-4">
//       <ToastContainer />
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h1 className="text-danger">👮 Police Dashboard</h1>
//         <button
//           className="btn btn-outline-danger"
//           onClick={() => setShowHandledModal(true)}
//         >
//           📜 Handled Alerts ({handledAlerts.length})
//         </button>
//       </div>

//       {stationData && (
//         <div className="mb-4 p-3 border rounded bg-light shadow-sm">
//           <p><b>Station:</b> {stationData.name}</p>
//           <p><b>Status:</b> {stationData.status}</p>
//           <p>
//             <b>Location:</b>{" "}
//             {stationData.location?.coordinates?.join(", ")}
//           </p>
//         </div>
//       )}

//       <h3 className="mb-3 text-danger">🚨 Active Alerts</h3>
//       {alerts.length === 0 ? (
//         <p className="text-muted">No active alerts yet.</p>
//       ) : (
//         <div className="row">
//           {alerts.map((alert) => (
//             <div
//               key={alert._id}
//               className={`col-md-6 mb-4 ${
//                 newAlertIds.includes(alert._id) ? "blink-alert" : ""
//               }`}
//               ref={(el) => (alertRefs.current[alert._id] = el)}
//             >
//               <div
//                 className={`card border-danger shadow-sm h-100 ${
//                   newAlertIds.includes(alert._id) ? "border-4" : ""
//                 }`}
//               >
//                 <div className="card-header bg-danger text-white fw-bold">
//                   {alert.userSnapshot?.fullName || "Unknown User"}
//                 </div>
//                 <div className="card-body">
//   <p><b>Message:</b> {alert.evidence?.message}</p>

// {alert.userSnapshot && (
//     <>
//       <p><b>Phone:</b> {alert.userSnapshot.phone || "N/A"}</p>
//       <p><b>Email:</b> {alert.userSnapshot.email || "N/A"}</p>

//       {alert.contactsSnapshot?.length > 0 && (
//         <>
//           <p><b>Emergency Contacts:</b></p>
//           <ul>
//             {alert.contactsSnapshot.map((c, idx) => (
//               <li key={idx}>
//                 {c.name} — {c.phone}
//               </li>
//             ))}
//           </ul>
//         </>
//       )}
//     </>
//   )}

//   <p>
//     <b>Location:</b>{" "}
//     {alert.location?.coordinates
//       ? `${alert.location.coordinates[1]}, ${alert.location.coordinates[0]}`
//       : "Not available"}
//   </p>
//   <p><b>Time:</b> {new Date(alert.createdAt).toLocaleString()}</p>

//   {alert.location?.coordinates && (
//     <button
//       className="btn btn-sm btn-outline-danger mb-2"
//       onClick={() => toggleMap(alert._id)}
//     >
//       {showMap[alert._id] ? "Hide Map" : "View on Map"}
//     </button>
//   )}

//   {showMap[alert._id] && alert.location?.coordinates && (
//     <MapContainer
//       center={[alert.location.coordinates[1], alert.location.coordinates[0]]}
//       zoom={13}
//       style={{ height: "200px", width: "100%" }}
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//       <Marker
//         position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
//       >
//         <Popup>
//           {alert.userSnapshot.fullName} <br />
//           {alert.evidence.message}
//         </Popup>
//       </Marker>
//     </MapContainer>
//   )}

//   <button
//     className="btn btn-sm btn-success mt-2"
//     onClick={() => acknowledgeAlert(alert._id)}
//   >
//     ✅ Acknowledge
//   </button>
// </div>

//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Handled Alerts Modal */}
//       <div
//         className={`modal fade ${showHandledModal ? "show d-block" : ""}`}
//         tabIndex="-1"
//         role="dialog"
//         style={{ backgroundColor: showHandledModal ? "rgba(0,0,0,0.5)" : "transparent" }}
//       >
//         <div className="modal-dialog modal-dialog-scrollable" role="document">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h5 className="modal-title">Handled Alerts</h5>
//               <button
//                 type="button"
//                 className="close btn"
//                 onClick={() => setShowHandledModal(false)}
//               >
//                 &times;
//               </button>
//             </div>
//             <div className="modal-body">
//               {handledAlerts.length === 0 ? (
//                 <p>No handled alerts yet.</p>
//               ) : (
//                 <ul className="list-group">
//                   {handledAlerts.map((a) => (
//                     <li className="list-group-item" key={a._id}>
//                       {a.userSnapshot?.fullName} - {a.evidence?.message} <br/>
//                       <small className="text-muted">{new Date(a.createdAt).toLocaleString()}</small>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <style>
//         {`
//           .blink-alert {
//             animation: blink 1s step-start 0s infinite;
//           }
//           @keyframes blink {
//             50% { border-color: #ff0000; box-shadow: 0 0 10px red; }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default PoliceDashboardPage;






// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import io from "socket.io-client";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import "bootstrap/dist/css/bootstrap.min.css";

// const socket = io("http://localhost:8080");

// const PoliceDashboardPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [handledAlerts, setHandledAlerts] = useState([]);
//   const [stationData, setStationData] = useState(null);
//   const [showMap, setShowMap] = useState({});
//   const [newAlertIds, setNewAlertIds] = useState([]);
//   const alertRefs = useRef({});
//   const [showHandledModal, setShowHandledModal] = useState(false);

//   const token = localStorage.getItem("policeToken");

//   const alertSound = () => {
//     const audio = new Audio("/siren.mp3");
//     audio.play().catch(() => console.log("Sound autoplay blocked"));
//   };

//   useEffect(() => {
//     axios
//       .get("http://localhost:8080/api/police/dashboard", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setStationData(res.data.station))
//       .catch(console.error);

//     fetch("http://localhost:8080/api/alerts/all")
//       .then((res) => res.json())
//       .then((data) => {
//         setAlerts(data.filter((a) => !a.acknowledged));
//         setHandledAlerts(data.filter((a) => a.acknowledged));
//       })
//       .catch(console.error);

//     const stationId = localStorage.getItem("policeStationId");
//     if (stationId) socket.emit("joinPolice", stationId);

//     socket.on("newAlert", (alert) => {
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
//         .catch(console.error);
//     }, 30000);

//     return () => {
//       socket.disconnect();
//       clearInterval(heartbeatInterval);
//     };
//   }, [token]);

//   const toggleMap = (id) => {
//     setShowMap((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

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
//       console.error("Error acknowledging alert:", err);
//     }
//   };

//   return (
//     <div className="container my-4">
//   <ToastContainer />
//   <div className="d-flex justify-content-between align-items-center mb-3">
//     <h1 className="text-primary text-center w-100">👮 Police Dashboard</h1>
//     <button
//       className="btn btn-outline-success"
//       onClick={() => setShowHandledModal(true)}
//     >
//       📜 Handled Alerts ({handledAlerts.length})
//     </button>
//   </div>

//   {stationData && (
//     <div className="mb-4 p-3 border rounded shadow-sm" style={{ backgroundColor: "#e9f5ff", borderColor: "#0d6efd" }}>
//       <p><b>Station:</b> {stationData.name}</p>
//       <p><b>Status:</b> <span style={{ color: stationData.status === "online" ? "#198754" : "#dc3545" }}>{stationData.status}</span></p>
//       <p>
//         <b>Location:</b>{" "}
//         {stationData.location?.coordinates?.join(", ")}
//       </p>
//     </div>
//   )}

//   <h3 className="mb-3 text-danger">🚨 Active Alerts</h3>
//   {alerts.length === 0 ? (
//     <p className="text-muted">No active alerts yet.</p>
//   ) : (
//     <div className="row">
//       {alerts.map((alert) => (
//         <div
//           key={alert._id}
//           className={`col-md-6 mb-4 ${newAlertIds.includes(alert._id) ? "blink-alert" : ""}`}
//           ref={(el) => (alertRefs.current[alert._id] = el)}
//         >
//           <div
//             className={`card shadow-sm h-100 ${newAlertIds.includes(alert._id) ? "border-4" : ""}`}
//             style={{
//               borderColor: "#dc3545",
//               backgroundColor: "#fff5f5"
//             }}
//           >
//             <div className="card-header fw-bold" style={{ backgroundColor: "#b02a37", color: "#fff" }}>
//               {alert.userSnapshot?.fullName || "Unknown User"}
//             </div>
//             <div className="card-body">
//               <p><b>Message:</b> {alert.evidence?.message}</p>
//               {alert.userSnapshot && (
//                 <>
//                   <p><b>Phone:</b> {alert.userSnapshot.phone || "N/A"}</p>
//                   <p><b>Email:</b> {alert.userSnapshot.email || "N/A"}</p>

//                   {alert.contactsSnapshot?.length > 0 && (
//                     <>
//                       <p><b>Emergency Contacts:</b></p>
//                       <ul>
//                         {alert.contactsSnapshot.map((c, idx) => (
//                           <li key={idx}>
//                             {c.name} — {c.phone}
//                           </li>
//                         ))}
//                       </ul>
//                     </>
//                   )}
//                 </>
//               )}

//               <p>
//                 <b>Location:</b>{" "}
//                 {alert.location?.coordinates
//                   ? `${alert.location.coordinates[1]}, ${alert.location.coordinates[0]}`
//                   : "Not available"}
//               </p>
//               <p><b>Time:</b> {new Date(alert.createdAt).toLocaleString()}</p>

//               {alert.location?.coordinates && (
//                 <button
//                   className="btn btn-sm btn-outline-primary mb-2"
//                   onClick={() => toggleMap(alert._id)}
//                 >
//                   {showMap[alert._id] ? "Hide Map" : "View on Map"}
//                 </button>
//               )}

//               {showMap[alert._id] && alert.location?.coordinates && (
//                 <MapContainer
//                   center={[alert.location.coordinates[1], alert.location.coordinates[0]]}
//                   zoom={13}
//                   style={{ height: "200px", width: "100%" }}
//                 >
//                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                   <Marker
//                     position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
//                   >
//                     <Popup>
//                       {alert.userSnapshot.fullName} <br />
//                       {alert.evidence.message}
//                     </Popup>
//                   </Marker>
//                 </MapContainer>
//               )}

//               <button
//                 className="btn btn-sm btn-danger mt-2"
//                 onClick={() => acknowledgeAlert(alert._id)}
//               >
//                 ✅ Acknowledge
//               </button>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   )}

//   {/* Handled Alerts Modal */}
//   <div
//     className={`modal fade ${showHandledModal ? "show d-block" : ""}`}
//     tabIndex="-1"
//     role="dialog"
//     style={{ backgroundColor: showHandledModal ? "rgba(0,0,0,0.5)" : "transparent" }}
//   >
//     <div className="modal-dialog modal-dialog-scrollable" role="document">
//       <div className="modal-content">
//         <div className="modal-header" style={{ backgroundColor: "#198754", color: "#fff" }}>
//           <h5 className="modal-title">Handled Alerts</h5>
//           <button
//             type="button"
//             className="close btn"
//             onClick={() => setShowHandledModal(false)}
//             style={{ color: "#fff" }}
//           >
//             &times;
//           </button>
//         </div>
//         <div className="modal-body">
//           {handledAlerts.length === 0 ? (
//             <p>No handled alerts yet.</p>
//           ) : (
//             <ul className="list-group">
//               {handledAlerts.map((a) => (
//                 <li className="list-group-item" key={a._id}>
//                   {a.userSnapshot?.fullName} - {a.evidence?.message} <br/>
//                   <small className="text-muted">{new Date(a.createdAt).toLocaleString()}</small>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>
//     </div>
//   </div>

//   <style>
//     {`
//       .blink-alert {
//         animation: blink 1s step-start 0s infinite;
//       }
//       @keyframes blink {
//         50% { border-color: #ff6b6b; box-shadow: 0 0 10px #ff6b6b; }
//       }
//     `}
//   </style>
// </div>

//   );
// };

// export default PoliceDashboardPage;
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import io from "socket.io-client";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import "bootstrap/dist/css/bootstrap.min.css";



// const PoliceDashboardPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [handledAlerts, setHandledAlerts] = useState([]);
//   const [stationData, setStationData] = useState(null);
//   const [showMap, setShowMap] = useState({});
//   const [newAlertIds, setNewAlertIds] = useState([]);
//   const [showHandledModal, setShowHandledModal] = useState(false);

//   const token = localStorage.getItem("policeToken");
// const socket = io("http://localhost:8080", {
//   auth: {
//     token: token
//   }
// });
//   const alertSound = () => {
//     const audio = new Audio("/siren.mp3");
//     audio.play().catch(() => {});
//   };

//   useEffect(() => {
//     // Fetch station info
//     axios
//       .get("http://localhost:8080/api/police/dashboard", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setStationData(res.data.station))
//       .catch(() => {});

//     // Fetch all alerts
//     axios
//       .get("http://localhost:8080/api/alerts/all")
//       .then((res) => {
//         const data = res.data;
//         setAlerts(data.filter((a) => !a.acknowledged));
//         setHandledAlerts(data.filter((a) => a.acknowledged));
//       })
//       .catch(() => {});

//     // Join police room
//     const stationId = localStorage.getItem("policeStationId");
//     if (stationId) socket.emit("joinPolice", stationId);

//     // Listen for new alerts
//     socket.on("newAlert", (alert) => {
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

//     // Heartbeat interval
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
//       socket.off("newAlert"); // remove listener on unmount
//     };
//   }, [token]);

//   const toggleMap = (id) => {
//     setShowMap((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

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
//     } catch (err) {}
//   };

//   return (
//     <div className="container my-4">
//       <ToastContainer />
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h1 className="text-primary text-center w-100">👮 Police Dashboard</h1>
//         <button
//           className="btn btn-outline-success"
//           onClick={() => setShowHandledModal(true)}
//         >
//           📜 Handled Alerts ({handledAlerts.length})
//         </button>
//       </div>

//       {stationData && (
//         <div
//           className="mb-4 p-3 border rounded shadow-sm"
//           style={{ backgroundColor: "#e9f5ff", borderColor: "#0d6efd" }}
//         >
//           <p>
//             <b>Station:</b> {stationData.name}
//           </p>
//           <p>
//             <b>Status:</b>{" "}
//             <span
//               style={{
//                 color: stationData.status === "online" ? "#198754" : "#dc3545",
//               }}
//             >
//               {stationData.status}
//             </span>
//           </p>
//           <p>
//             <b>Location:</b>{" "}
//             {stationData.location?.coordinates?.join(", ")}
//           </p>
//         </div>
//       )}

//       <h3 className="mb-3 text-danger">🚨 Active Alerts</h3>
//       {alerts.length === 0 ? (
//         <p className="text-muted">No active alerts yet.</p>
//       ) : (
//         <div className="row">
//           {alerts.map((alert) => (
//             <div
//               key={alert._id}
//               className={`col-md-6 mb-4 ${
//                 newAlertIds.includes(alert._id) ? "blink-alert" : ""
//               }`}
//             >
//               <div
//                 className={`card shadow-sm h-100 ${
//                   newAlertIds.includes(alert._id) ? "border-4" : ""
//                 }`}
//                 style={{ borderColor: "#dc3545", backgroundColor: "#fff5f5" }}
//               >
//                 <div
//                   className="card-header fw-bold"
//                   style={{ backgroundColor: "#b02a37", color: "#fff" }}
//                 >
//                   {alert.userSnapshot?.fullName || "Unknown User"}
//                 </div>
//                 <div className="card-body">
//                   <p>
//                     <b>Message:</b> {alert.evidence?.message}
//                   </p>
//                   {alert.userSnapshot && (
//                     <>
//                       <p>
//                         <b>Phone:</b> {alert.userSnapshot.phone || "N/A"}
//                       </p>
//                       <p>
//                         <b>Email:</b> {alert.userSnapshot.email || "N/A"}
//                       </p>
//                       {alert.contactsSnapshot?.length > 0 && (
//                         <>
//                           <p>
//                             <b>Emergency Contacts:</b>
//                           </p>
//                           <ul>
//                             {alert.contactsSnapshot.map((c, idx) => (
//                               <li key={idx}>
//                                 {c.name} — {c.phone}
//                               </li>
//                             ))}
//                           </ul>
//                         </>
//                       )}
//                     </>
//                   )}
//                   <p>
//                     <b>Location:</b>{" "}
//                     {alert.location?.coordinates
//                       ? `${alert.location.coordinates[1]}, ${alert.location.coordinates[0]}`
//                       : "Not available"}
//                   </p>
//                   <p>
//                     <b>Time:</b> {new Date(alert.createdAt).toLocaleString()}
//                   </p>
//                   {alert.location?.coordinates && (
//                     <button
//                       className="btn btn-sm btn-outline-primary mb-2"
//                       onClick={() => toggleMap(alert._id)}
//                     >
//                       {showMap[alert._id] ? "Hide Map" : "View on Map"}
//                     </button>
//                   )}
//                   {showMap[alert._id] && alert.location?.coordinates && (
//                     <MapContainer
//                       center={[
//                         alert.location.coordinates[1],
//                         alert.location.coordinates[0],
//                       ]}
//                       zoom={13}
//                       style={{ height: "200px", width: "100%" }}
//                     >
//                       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                       <Marker
//                         position={[
//                           alert.location.coordinates[1],
//                           alert.location.coordinates[0],
//                         ]}
//                       >
//                         <Popup>
//                           {alert.userSnapshot.fullName} <br />
//                           {alert.evidence.message}
//                         </Popup>
//                       </Marker>
//                     </MapContainer>
//                   )}
//                   <button
//                     className="btn btn-sm btn-danger mt-2"
//                     onClick={() => acknowledgeAlert(alert._id)}
//                   >
//                     ✅ Acknowledge
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Handled Alerts Modal */}
//       {showHandledModal && (
//         <div
//           className="modal d-block"
//           tabIndex="-1"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog modal-dialog-scrollable">
//             <div className="modal-content">
//               <div
//                 className="modal-header"
//                 style={{ backgroundColor: "#198754", color: "#fff" }}
//               >
//                 <h5 className="modal-title">Handled Alerts</h5>
//                 <button
//                   type="button"
//                   className="btn-close btn"
//                   onClick={() => setShowHandledModal(false)}
//                   style={{ color: "#fff" }}
//                 >
//                   &times;
//                 </button>
//               </div>
//               <div className="modal-body">
//                 {handledAlerts.length === 0 ? (
//                   <p>No handled alerts yet.</p>
//                 ) : (
//                   <ul className="list-group">
//                     {handledAlerts.map((a) => (
//                       <li className="list-group-item" key={a._id}>
//                         {a.userSnapshot?.fullName} - {a.evidence?.message} <br />
//                         <small className="text-muted">
//                           {new Date(a.createdAt).toLocaleString()}
//                         </small>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>
//         {`
//           .blink-alert {
//             animation: blink 1s step-start infinite;
//           }
//           @keyframes blink {
//             50% { border-color: #ff6b6b; box-shadow: 0 0 10px #ff6b6b; }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default PoliceDashboardPage;
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";

const PoliceDashboardPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [handledAlerts, setHandledAlerts] = useState([]);
  const [stationData, setStationData] = useState(null);
  const [showMap, setShowMap] = useState({});
  const [newAlertIds, setNewAlertIds] = useState([]);
  const [showHandledModal, setShowHandledModal] = useState(false);

  const socketRef = useRef(null);
  const token = localStorage.getItem("policeToken");

  const alertSound = () => {
    const audio = new Audio("/siren.mp3");
    audio.play().catch(() => {});
  };

  useEffect(() => {
    // Fetch station info
    
    axios
      .get("http://localhost:8080/api/police/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStationData(res.data.station))
      .catch((err) => console.error(err));

    // Fetch all alerts
    axios
      .get("http://localhost:8080/api/alerts/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setAlerts(data.filter((a) => !a.acknowledged));
        setHandledAlerts(data.filter((a) => a.acknowledged));
      })
      .catch((err) => console.error(err));

    // Initialize socket connection once
    socketRef.current = io("http://localhost:8080", {
      auth: { token },
    });

    // Join police room
    const stationId = localStorage.getItem("policeStationId");
    if (stationId) socketRef.current.emit("joinPolice", stationId);

    // Listen for new alerts
    socketRef.current.on("newAlert", (alert) => {
      setAlerts((prev) => [alert, ...prev]);
      setNewAlertIds((prev) => [...prev, alert._id]);
      alertSound();
     
      setTimeout(() => {
        setNewAlertIds((prev) => prev.filter((id) => id !== alert._id));
      }, 10000);
    });

    // Heartbeat interval
    const heartbeatInterval = setInterval(() => {
      axios
        .post(
          "http://localhost:8080/api/police/heartbeat",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch(() => {});
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [token]);

  const toggleMap = (id) => {
    setShowMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // const acknowledgeAlert = async (id) => {
  //   setNewAlertIds((prev) => prev.filter((alertId) => alertId !== id));
   

  //   try {
  //     const res = await axios.post(
  //       `http://localhost:8080/api/alerts/acknowledge/${id}`,
  //       {},
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     const ackAlert = res.data.alert;
  //     setAlerts((prev) => prev.filter((a) => a._id !== id));
  //     setHandledAlerts((prev) => [ackAlert, ...prev]);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
const acknowledgeAlert = async (id) => {
  try {
    await axios.post(
      `http://localhost:8080/api/alerts/acknowledge/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // alerts list ko update karo, sirf acknowledged flag change
    setAlerts((prev) =>
      prev.map((alert) =>
        alert._id === id ? { ...alert, acknowledged: true } : alert
      )
    );
     toast.success("Alert acknowledged!");
  } catch (err) {
    console.error(err);
  }
};
  return (
    <div className="container my-4">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="text-primary text-center w-100">👮 Police Dashboard</h1>
        <button
          className="btn btn-outline-success"
          onClick={() => setShowHandledModal(true)}
        >
          📜 Handled Alerts ({handledAlerts.length})
        </button>
      </div>

      {stationData && (
        <div
          className="mb-4 p-3 border rounded shadow-sm"
          style={{ backgroundColor: "#e9f5ff", borderColor: "#0d6efd" }}
        >
          <p>
            <b>Station:</b> {stationData.name}
          </p>
          <p>
            <b>Status:</b>{" "}
            <span
              style={{
                color: stationData.status === "online" ? "#198754" : "#dc3545",
              }}
            >
              {stationData.status}
            </span>
          </p>
          <p>
            <b>Location:</b>{" "}
            {stationData.location?.coordinates?.join(", ")}
          </p>
        </div>
      )}

      <h3 className="mb-3 text-danger">🚨 Active Alerts</h3>
      {alerts.length === 0 ? (
        <p className="text-muted">No active alerts yet.</p>
      ) : (
        <div className="row">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`col-md-6 mb-4 ${
                newAlertIds.includes(alert._id) ? "blink-alert" : ""
              }`}
            >
              <div
                className={`card shadow-sm h-100 ${
                  newAlertIds.includes(alert._id) ? "border-4" : ""
                }`}
                style={{ borderColor: "#dc3545", backgroundColor: "#fff5f5" }}
              >
                <div
                  className="card-header fw-bold"
                  style={{ backgroundColor: "#b02a37", color: "#fff" }}
                >
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
                      {alert.contactsSnapshot?.length > 0 && (
                        <>
                          <p>
                            <b>Emergency Contacts:</b>
                          </p>
                          <ul>
                            {alert.contactsSnapshot.map((c, idx) => (
                              <li key={idx}>
                                {c.name} — {c.phone}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  )}
                  <p>
                    <b>Location:</b>{" "}
                    {alert.location?.coordinates
                      ? `${alert.location.coordinates[1]}, ${alert.location.coordinates[0]}`
                      : "Not available"}
                  </p>
                  <p>
                    <b>Time:</b> {new Date(alert.createdAt).toLocaleString()}
                  </p>
                  {alert.location?.coordinates && (
                    <button
                      className="btn btn-sm btn-outline-primary mb-2"
                      onClick={() => toggleMap(alert._id)}
                    >
                      {showMap[alert._id] ? "Hide Map" : "View on Map"}
                    </button>
                  )}
                  {showMap[alert._id] && alert.location?.coordinates && (
                    <MapContainer
                      center={[
                        alert.location.coordinates[1],
                        alert.location.coordinates[0],
                      ]}
                      zoom={13}
                      style={{ height: "200px", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[
                          alert.location.coordinates[1],
                          alert.location.coordinates[0],
                        ]}
                      >
                        <Popup>
                          {alert.userSnapshot.fullName} <br />
                          {alert.evidence.message}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  )}
                  <button
                    className="btn btn-sm btn-danger mt-2"
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
      {showHandledModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div
                className="modal-header"
                style={{ backgroundColor: "#198754", color: "#fff" }}
              >
                <h5 className="modal-title">Handled Alerts</h5>
                <button
                  type="button"
                  className="btn-close btn"
                  onClick={() => setShowHandledModal(false)}
                  style={{ color: "#fff" }}
                >
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
                        {a.userSnapshot?.fullName} - {a.evidence?.message} <br />
                        <small className="text-muted">
                          {new Date(a.createdAt).toLocaleString()}
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .blink-alert {
            animation: blink 1s step-start infinite;
          }
          @keyframes blink {
            50% { border-color: #ff6b6b; box-shadow: 0 0 10px #ff6b6b; }
          }
        `}
      </style>
    </div>
  );
};

export default PoliceDashboardPage;

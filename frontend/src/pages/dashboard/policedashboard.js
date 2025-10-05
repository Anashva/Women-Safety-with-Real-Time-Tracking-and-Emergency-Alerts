// import React, { useEffect, useState } from "react";
// import { Shield, MapPin, History } from "lucide-react";
// import { Link } from "react-router-dom";
// import io from "socket.io-client";
// import axios from "axios";

// // Connect to backend
// const socket = io("http://localhost:8080");

// const PoliceDashboardPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [stationData, setStationData] = useState(null);
//   const stationId = "12345"; // you can replace with logged-in police _id

// useEffect(() => {
//   // 1️⃣ Fetch Police Dashboard info
//     axios
//       .get("http://localhost:8080/api/police/dashboard", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("policeToken")}`,
//         },
//       })
//       .then((res) => {
//         console.log("Station Info:", res.data);
//         setStationData(res.data.station);
//       })
//       .catch((err) => console.error("Dashboard fetch error:", err));





//   // 1️⃣ Fetch all existing alerts from backend on first load
//   fetch("http://localhost:8080/api/alert/all")
//     .then((res) => res.json())
//     .then((data) => {
//       setAlerts(data);
//     })
//     .catch(console.error);

//   // 2️⃣ Join the police room
//   socket.emit("joinPolice", stationId);

//   // 3️⃣ Listen for new SOS alerts (real-time)
//   socket.on("newAlert", (alert) => {
//     console.log("🚨 New SOS Alert Received:", alert);
//     setAlerts((prev) => [alert, ...prev]); // prepend new alert
//     alertSound();
//   });

//   // 4️⃣ Cleanup socket when component unmounts
//   return () => socket.disconnect();
// }, []);


//   // Optional sound alert
//   const alertSound = () => {
//     const audio = new Audio("/siren.mp3");
//     audio.play().catch(() => console.log("Sound autoplay blocked"));
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Navbar */}
//       <nav className="navbar bg-dark text-white px-4 py-3 d-flex justify-content-between align-items-center">
//         <h1 className="logo text-danger">SafeHer - Police</h1>
//         <div className="nav-links">
//           <Link to="/police/register" className="btn btn-outline-light me-2">
//             Register
//           </Link>
//           <Link to="/police/login" className="btn btn-outline-light">
//             Login
//           </Link>
//         </div>
//       </nav>

//       {/* Hero */}
//       <section className="hero text-center text-white bg-danger p-5">
//         <h2 className="display-5 fw-bold">Police Dashboard</h2>
//         <p className="lead mt-3">
//           Monitor SOS alerts and respond in real-time.
//         </p>
//       </section>

//       {/* Live Alerts Section */}
//       <section className="container my-5">
//         <h3 className="text-center mb-4 text-danger">🚨 Live Alerts</h3>

//         {alerts.length === 0 ? (
//           <p className="text-center text-muted">No active alerts yet.</p>
//         ) : (
//           <div className="row">
//             {alerts.map((alert) => (
//               <div className="col-md-6 mb-3" key={alert._id}>
//                 <div className="card p-3 shadow-sm border-danger border-2">
//                   <h5 className="text-danger">
//                     {alert.userSnapshot?.fullName || "Unknown User"}
//                   </h5>
//                   <p>
//                     📍 Location:{" "}
//                     {alert.location?.coordinates
//                       ? `${alert.location.coordinates[1]}, ${alert.location.coordinates[0]}`
//                       : "Not available"}
//                   </p>
//                   <p>🕒 Time: {new Date(alert.createdAt).toLocaleString()}</p>
//                   <p>💬 Message: {alert.evidence?.message}</p>
//                   <button className="btn btn-sm btn-outline-danger mt-2">
//                     View on Map
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* Footer */}
//       <footer className="footer bg-dark text-white text-center py-3">
//         © {new Date().getFullYear()} SafeHer. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default PoliceDashboardPage;


import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

const PoliceDashboardPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [stationData, setStationData] = useState(null);

  // Token from localStorage
  const token = localStorage.getItem("policeToken");

  useEffect(() => {
    const stationId = localStorage.getItem("policeStationId"); // make sure you save this on login
    if (stationId) {
  socket.emit("joinPolice", stationId);
}

socket.on("newAlert", (alert) => {
  console.log("🚨 New SOS Alert:", alert);
  setAlerts(prev => [alert, ...prev]);
});



    // Fetch station info
    axios
      .get("http://localhost:8080/api/police/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStationData(res.data.station))
      .catch(console.error);

    // Fetch all existing alerts
    axios
      .get("http://localhost:8080/api/alerts/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAlerts(res.data))
      .catch(console.error);

    // ✅ Heartbeat interval (every 30 seconds)
    const heartbeatInterval = setInterval(() => {
      axios
        .post(
          "http://localhost:8080/api/police/heartbeat",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => console.log("Heartbeat sent:", res.data.message))
        .catch((err) => console.error("Heartbeat error:", err));
    }, 30000);

    // Cleanup on unmount
    return () => {
      socket.off("newAlert"); // remove listener only
      clearInterval(heartbeatInterval); // clear heartbeat
    };
  }, [token]);
  return (
    <div>
      <h1>👮 Police Dashboard</h1>

      {stationData ? (
        <div>
          <p><b>Station:</b> {stationData.name}</p>
          <p><b>Status:</b> {stationData.status}</p>
          <p>
            <b>Location:</b>{" "}
            {stationData.location?.coordinates?.join(", ")}
          </p>
        </div>
      ) : (
        <p>Loading station info...</p>
      )}

      <hr />
      <h3>Active Alerts:</h3>
      <ul>
        {alerts.map((a) => (
          <li key={a._id}>
            {a.userSnapshot?.fullName} - {a.evidence?.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PoliceDashboardPage;


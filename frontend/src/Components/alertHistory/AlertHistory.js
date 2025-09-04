import React from 'react'
import { useEffect, useState } from 'react';
const AlertHistory = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/alerts/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading alerts...</p>;







  return (
    <div className="container mt-5">
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
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <tr key={alert._id}>
                <td>{index + 1}</td>
                <td>{alert.message}</td>
                <td>
                  {alert.latitude}, {alert.longitude}
                </td>
                <td>{new Date(alert.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AlertHistory
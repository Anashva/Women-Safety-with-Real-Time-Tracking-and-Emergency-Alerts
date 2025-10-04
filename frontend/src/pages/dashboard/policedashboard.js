import React from "react";
import { Shield, MapPin, History } from "lucide-react";
import { Link } from "react-router-dom";

const PoliceDashboardPage = () => {
  return (
    
    <div className="dashboard-container">

      <nav className="navbar bg-dark text-white px-4 py-3 d-flex justify-content-between align-items-center">
      {/* Logo */}
      <h1 className="logo text-danger">SafeHer - Police</h1>

      {/* Navigation Links */}
      <div className="nav-links">
      
        <Link to="/police/register" className="btn btn-outline-light me-2">
          Register
        </Link>
        <Link to="/police/login" className="btn btn-outline-light">
          Login
        </Link>
      </div>
    </nav>
      {/* Hero Section */}
      <section className="hero text-center d-flex flex-column justify-content-center align-items-center text-white bg-danger p-5">
        <h2 className="display-4 fw-bold">Welcome to Police Dashboard</h2>
        <p className="lead mt-3">
          Monitor SOS alerts, track locations, and manage emergency responses.
        </p>
      </section>

      {/* Features */}
      <section className="features container text-center py-5">
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm p-4">
              <Shield size={50} className="mb-3 text-danger" />
              <h3>Active Alerts</h3>
              <p>See all current SOS alerts.</p>
              <button className="btn btn-danger mt-3">View Alerts</button>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card shadow-sm p-4">
              <MapPin size={50} className="mb-3 text-danger" />
              <h3>Live Tracking</h3>
              <p>Track user locations in real-time.</p>
              <button className="btn btn-danger mt-3">Start Tracking</button>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card shadow-sm p-4">
              <History size={50} className="mb-3 text-danger" />
              <h3>Alert History</h3>
              <p>Review past alerts and responses.</p>
              <button className="btn btn-danger mt-3">View History</button>
            </div>
          </div>
        </div>
      </section>

    

      {/* Footer */}
      <footer className="footer bg-dark text-white text-center py-3">
        © {new Date().getFullYear()} SafeHer. All rights reserved.
      </footer>
    </div>
  );
};

export default PoliceDashboardPage;

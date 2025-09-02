import React from 'react'
import {Link} from 'react-router-dom'
import {Shield,MapPin,History} from 'lucide-react'
const Dashboard = () => {
  return (
     <div className="dashboard-container">
      {/* Navbar */}
      <header className="navbar bg-dark text-white px-4 py-3 d-flex justify-content-between align-items-center">
        <h1 className="logo text-danger">SafeHer</h1>
        <nav>
          <span className="me-3">Welcome, User 👋</span>
          <Link to="/" className="btn btn-outline-light">
            Logout
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero text-center d-flex flex-column justify-content-center align-items-center text-white bg-danger p-5">
        <div className="container">
          <h2 className="display-4 fw-bold">
            Welcome to <span className="text-dark">SafeHer Dashboard</span>
          </h2>
          <p className="lead mt-3">
            Manage your alerts, track live locations, and check your alert history.
          </p>
          <Link to="/alerts" className="btn btn-dark btn-lg mt-4">
            🚨 View Alerts
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container text-center py-5">
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm p-4">
              <Shield size={50} className="mb-3 text-danger" />
              <h3>SOS Alerts</h3>
              <p>Send instant SOS with your location.</p>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card shadow-sm p-4">
              <MapPin size={50} className="mb-3 text-danger" />
              <h3>Live Tracking</h3>
              <p>Share your real-time location with friends and police.</p>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card shadow-sm p-4">
              <History size={50} className="mb-3 text-danger" />
              <h3>Alert History</h3>
              <p>Review past alerts anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-dark text-white text-center py-3">
        © {new Date().getFullYear()} SafeHer. All rights reserved.
      </footer>
    </div>
  )
}

export default Dashboard
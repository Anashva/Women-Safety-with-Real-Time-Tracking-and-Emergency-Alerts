import React from 'react'
import {Link} from 'react-router-dom'
import {Shield, MapPin,History} from 'lucide-react'
import "bootstrap/dist/css/bootstrap.min.css"
import  '../home/Home.module.css'


const Home = () => {
  return (
     <div className="home-container">
      {/* Navbar */}
      <header className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <h1 className="navbar-brand fw-bold">SafeHer 🚺</h1>
        <nav className="ms-auto d-flex gap-2">
          <Link to="/login" className="btn btn-outline-light">
            Login
          </Link>
          <Link to="/register" className="btn btn-danger">
            Register
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero text-center d-flex flex-column justify-content-center align-items-center ">
        <div className="container">
          <h2 className="display-4 fw-bold text-black">
            {/* Respect her, Protect her */}
            Your Safety, <span className="text-danger">Our Priority</span>
          </h2>
          <p className="lead mt-3 fw-bold">
            SafeHer is a women safety app with SOS alerts, live location
            tracking, and alert history to keep you safe anytime, anywhere.
          </p>
          <Link to="/dashboard" className="btn btn-danger btn-lg mt-4">
            🚀 Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <div className="card shadow-lg border-0 h-100">
                <div className="card-body">
                  <Shield size={50} className="text-danger mb-3" />
                  <h3 className="fw-bold">SOS Alerts</h3>
                  <p className="text-muted">Send instant SOS with your location.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card shadow-lg border-0 h-100">
                <div className="card-body">
                  <MapPin size={50} className="text-danger mb-3" />
                  <h3 className="fw-bold">Live Tracking</h3>
                  <p className="text-muted">
                    Share your real-time location with friends and police.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card shadow-lg border-0 h-100">
                <div className="card-body">
                  <History size={50} className="text-danger mb-3" />
                  <h3 className="fw-bold">Alert History</h3>
                  <p className="text-muted">Review past alerts anytime.</p>
                </div>
              </div>
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

export default Home
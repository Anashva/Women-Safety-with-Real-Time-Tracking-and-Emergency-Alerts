import React, { useEffect } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {Shield,MapPin,History} from 'lucide-react'
import { useState }  from 'react';
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Dashboard = () => {

  

  const [user,setUser]=useState(null);

  const navigate=useNavigate();

 
  useEffect(()=>{
    const token=localStorage.getItem("token");
    if (!token) {
      navigate("/login"); 
      return;
    }

    fetch("http://localhost:8080/api/users/profile",{
       headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
        if (res.status === 401) {
          navigate("/login"); 
        }
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
  const userId = localStorage.getItem("userId"); // make sure you save this when user logs in
  if (!userId) return;

  const socket = io("http://localhost:8080");

  socket.emit("joinUser", userId);

  socket.on("alertAcknowledged", (data) => {
    toast.success(data.message, { position: "top-right" });
  });
 


  return () => {
    socket.disconnect();
  };
}, []);


  return (
     <div className="dashboard-container">
      <ToastContainer/>
      {/* Navbar */}
      <header className="navbar bg-dark text-white px-4 py-3 d-flex justify-content-between align-items-center">
        <h1 className="logo text-danger">SafeHer</h1>
        <nav>
          <span className="me-3">{user ? `Welcome, ${user.fullName} 👋` : "Loading..."}</span>
          <Link to="/" className="btn btn-outline-light" onClick={() => {localStorage.removeItem("token"); // logout properly
            navigate("/login");}}>
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
               {/*  Emergency Button link */}
               <Link to="/emergency" className="btn btn-danger mt-3">Emergency</Link>
            </div>
          </div>

      <div
            className="col-md-4 mb-4"
            onClick={() => navigate("/live-tracking")}
            style={{ cursor: "pointer" }}
          >
            <div className="card shadow-sm p-4">
            <MapPin size={50} className="mb-3 text-danger" />
            <h3>Live Tracking</h3>
            <p>Share your real-time location with friends and police.</p>
            <Link to="/map-tracking" className="btn btn-danger mt-3">
              Start Live Tracking
            </Link>
          </div>
</div>

          <div className="col-md-4 mb-4">
            <div className="card shadow-sm p-4">
              <History size={50} className="mb-3 text-danger" />
              <h3>Alert History</h3>
              <p>Review past alerts anytime.</p>
              {/* showing all history of alert */}
              <Link to="/history" className="btn btn-danger mt-3">View History</Link>
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
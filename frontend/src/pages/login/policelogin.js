import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const PoliceLogin = () => {
  const [username, setUsername] = useState(""); // changed from badgeId to username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/police/login", {
        username, // send username instead of badgeId
        password,
      });

      localStorage.setItem("policeToken", res.data.token);
      localStorage.setItem("policeStationId", res.data.station._id);

      navigate("/police/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #f8d7da, #ffe5e9)",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{ width: "100%", maxWidth: "420px", borderRadius: "15px" }}
      >
        <h2 className="text-center mb-4 text-danger fw-bold">👮 Police Login</h2>

        {error && (
          <div className="alert alert-danger text-center py-2">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ borderRadius: "10px" }}
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ borderRadius: "10px" }}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-danger w-100 py-2 fw-bold"
            style={{ borderRadius: "12px", transition: "0.3s" }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
          >
            🚀 Login
          </button>

          {/* Register link */}
          <p className="text-center mt-3 mb-0">
            Don’t have an account?{" "}
            <Link to="/police/register" className="text-danger fw-bold">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PoliceLogin;

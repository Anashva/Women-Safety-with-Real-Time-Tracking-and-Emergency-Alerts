import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PoliceRegisterPage = () => {
  const navigate = useNavigate();
  const [stationName, setStationName] = useState("");
  const [officerName, setOfficerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    // Frontend-only: just show alert
    alert(`✅ Police Station Registered!
Station: ${stationName}
Officer: ${officerName}
Phone: ${phone}
Email: ${email}
Location: ${longitude}, ${latitude}`);
    // Navigate to dashboard (or login)
    navigate("/police/dashboard");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg, #fff5f5, #ffe6e6)" }}
    >
      <div className="card shadow-lg p-4 rounded-4" style={{ width: "450px" }}>
        <h2 className="text-center text-danger mb-4 fw-bold">Police Register</h2>
        <form onSubmit={handleRegister}>
          {/* Station Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Station Name</label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Enter station name"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              required
            />
          </div>

          {/* Officer Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Officer Name</label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Enter officer name"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Phone (10 digits)</label>
            <input
              type="tel"
              className="form-control rounded-3"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control rounded-3"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control rounded-3"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Location */}
          <div className="mb-3 d-flex gap-2">
            <div className="flex-grow-1">
              <label className="form-label fw-semibold">Longitude</label>
              <input
                type="number"
                step="any"
                className="form-control rounded-3"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
            </div>
            <div className="flex-grow-1">
              <label className="form-label fw-semibold">Latitude</label>
              <input
                type="number"
                step="any"
                className="form-control rounded-3"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-danger w-100 rounded-3 fw-semibold"
          >
            🚓 Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default PoliceRegisterPage;

import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contacts, setContacts] = useState([{ name: "", phone: "" }]);

  const addContact = () => {
    setContacts([...contacts, { name: "", phone: "" }]);
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...contacts];
    updatedContacts[index][field] = value;
    setContacts(updatedContacts);
  };

  const removeContact = (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/users/register", {
        fullName,
        phone,
        email,
        password,
        contacts,
      });
      localStorage.setItem("token", res.data.token);
      alert("✅ Registration successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #fff5f5, #ffe6e6)", // 🔹 light pastel bg
      }}
    >
      <div className="card shadow-lg p-4 rounded-4" style={{ width: "450px" }}>
        <h2 className="text-center text-danger mb-4 fw-bold">Register</h2>
        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Phone Number</label>
            <input
              type="tel"
              className="form-control rounded-3"
              placeholder="Enter your phone number"
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
              placeholder="Enter your email"
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

          {/* Emergency Contacts */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Emergency Contacts</label>
            {contacts.map((contact, index) => (
              <div key={index} className="d-flex mb-2">
                <input
                  type="text"
                  className="form-control me-2 rounded-3"
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) =>
                    handleContactChange(index, "name", e.target.value)
                  }
                />
                <input
                  type="text"
                  className="form-control me-2 rounded-3"
                  placeholder="Phone"
                  value={contact.phone}
                  onChange={(e) =>
                    handleContactChange(index, "phone", e.target.value)
                  }
                />
                {contacts.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeContact(index)}
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm mt-2 rounded-3"
              onClick={addContact}
            >
              + Add Contact
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-danger w-100 rounded-3 fw-semibold"
          >
            🚀 Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

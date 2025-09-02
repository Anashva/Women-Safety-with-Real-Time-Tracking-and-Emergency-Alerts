import React  from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import { useState } from 'react'



const Login = () => {

const [username, setUsername] = useState(""); // since you are using username instead of email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // axios.post me direct data bhejna hota hai
      const res = await axios.post("http://localhost:8080/api/users/login", {
        username,
        password,
      });

      // response se token nikalna
      localStorage.setItem("token", res.data.token);

      // redirect karna
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };


  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Login</h2>
      <form className="mx-auto" style={{ maxWidth: "400px" }} onSubmit={handleSubmit}>

        {/* Username */}
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your username" value={username}
            onChange={(e) => setUsername(e.target.value)} required/>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password" value={password}
            onChange={(e) => setPassword(e.target.value)} required/>
        </div>

        {/* Login Button */}
        <button type="submit" className="btn btn-danger w-100">
          Login
        </button>

        {/* Register link */}
        <p className="text-center mt-3">
          Don’t have an account?{" "}
          <Link to="/register" className="text-danger fw-bold">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login
import React from 'react'
import {Link} from 'react-router-dom'
const Login = () => {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Login</h2>
      <form className="mx-auto" style={{ maxWidth: "400px" }}>
        {/* Username */}
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your username" required/>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password" required/>
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
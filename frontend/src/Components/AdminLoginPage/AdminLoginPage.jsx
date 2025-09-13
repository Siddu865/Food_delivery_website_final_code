import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLoginPage.css";
import Cookies from "js-cookie";

const AdminLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    try {
      const res = await fetch("http://localhost:5555/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Cookies.set("admin_jwt", data.token, {
          expires: 1, // 1 day expiry (you can adjust this)
          secure: true, // only send over HTTPS
          sameSite: "Strict",
        });

        setAlert({ type: "success", message: data.message });
        setTimeout(() => navigate("/admin"), 1500);
      } else {
        setAlert({ type: "error", message: data.message || "Login failed!" });
      }
    } catch (err) {
      setAlert({ type: "error", message: "Server error. Please try again!" });
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-card" onSubmit={handleLogin}>
        <h2>Admin Login</h2>

        {alert.message && (
          <div className={`alert ${alert.type}`}>{alert.message}</div>
        )}

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <span>Show Password</span>
        </div>

        <button type="submit" className="login-btn">
          Admin Login
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;

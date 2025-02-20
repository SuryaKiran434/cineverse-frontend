import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_id", data.user_id);
        navigate("/home");
      } else {
        setError(data.detail || "Login failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  const inputStyle = {
    padding: "0.75rem",
    borderRadius: "0.375rem",
    border: "none",
    backgroundColor: "#292929",
    color: "white",
    outline: "none",
    fontSize: "1.125rem",
    width: "100%",
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#121212",
        color: "white",
      }}
    >
      <h2 style={{ fontSize: "2.2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Login</h2>
      {error && <p style={{ color: "#ff5252", fontSize: "1.1rem" }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", maxWidth: "400px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "white",
              fontSize: "1.2rem",
              zIndex: 10,
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <button
          type="submit"
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#10B981",
            color: "white",
            borderRadius: "0.375rem",
            border: "none",
            cursor: "pointer",
            transition: "background 0.3s",
            fontSize: "1.125rem",
            alignSelf: "center",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#059669")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#10B981")}
        >
          Login
        </button>
      </form>
      <style>
        {`
          input {
            background-color: #292929 !important;
            color: white !important;
          }
          input:focus {
            background-color: #292929 !important;
            color: white !important;
          }
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #292929 inset !important;
            -webkit-text-fill-color: white !important;
          }
        `}
      </style>
    </div>
  );
}

export default Login;

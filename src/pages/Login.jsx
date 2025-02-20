import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
      <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1rem" }}>Login</h2>
      {error && <p style={{ color: "#ff5252" }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "0.75rem",
            borderRadius: "0.25rem",
            border: "none",
            backgroundColor: "#292929",
            color: "white",
            outline: "none",
          }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "0.75rem",
            borderRadius: "0.25rem",
            border: "none",
            backgroundColor: "#292929",
            color: "white",
            outline: "none",
          }}
          required
        />
        <button
          type="submit"
          style={{
            padding: "0.75rem",
            backgroundColor: "#10B981",
            color: "white",
            borderRadius: "0.25rem",
            border: "none",
            cursor: "pointer",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#059669")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#10B981")}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;

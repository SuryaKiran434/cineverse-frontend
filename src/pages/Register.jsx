import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";

function Register() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#121212",
        color: "white",
      }}
    >
      <div
        style={{
          backgroundColor: "#1e1e1e",
          padding: "2rem",
          borderRadius: "0.5rem",
          boxShadow: "0px 0px 15px rgba(255, 255, 255, 0.1)",
          width: "350px",
          textAlign: "center",
          animation: "fadeIn 1s ease-in-out",
        }}
      >
        <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1rem" }}>Register</h2>
        {error && <p style={{ color: "#ff5252" }}>{error}</p>}
        {success && <p style={{ color: "#4caf50" }}>{success}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="text"
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleChange}
            required
            style={{
              padding: "0.75rem",
              borderRadius: "0.25rem",
              border: "none",
              backgroundColor: "#292929",
              color: "white",
              outline: "none",
            }}
          />
          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            required
            style={{
              padding: "0.75rem",
              borderRadius: "0.25rem",
              border: "none",
              backgroundColor: "#292929",
              color: "white",
              outline: "none",
            }}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              padding: "0.75rem",
              borderRadius: "0.25rem",
              border: "none",
              backgroundColor: "#292929",
              color: "white",
              outline: "none",
            }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              padding: "0.75rem",
              borderRadius: "0.25rem",
              border: "none",
              backgroundColor: "#292929",
              color: "white",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem",
              backgroundColor: "#2563EB",
              color: "white",
              borderRadius: "0.25rem",
              border: "none",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1D4ED8")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2563EB")}
          >
            Register
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#ccc" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#3B82F6", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;

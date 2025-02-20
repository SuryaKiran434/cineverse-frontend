import { useEffect } from "react";
import React from "react";
function Landing() {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when mounted
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a", // Dark Gray Background
        color: "white",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          animation: "fadeIn 1s ease-in-out",
        }}
      >
        Welcome to Cineverse
      </h1>
      
      <div style={{ display: "flex", gap: "1rem" }}>
        <a href="/register">
          <button
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#2563EB", // Blue
              borderRadius: "0.375rem",
              color: "white",
              fontSize: "1.125rem",
              border: "none",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1D4ED8")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2563EB")}
          >
            Register
          </button>
        </a>

        <a href="/login">
          <button
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#10B981", // Green
              borderRadius: "0.375rem",
              color: "white",
              fontSize: "1.125rem",
              border: "none",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#059669")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#10B981")}
          >
            Login
          </button>
        </a>
      </div>
    </div>
  );
}

export default Landing;

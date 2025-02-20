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
        backgroundImage: 'url(/Landing.png)',
        backgroundSize: "cover", // Ensures the image covers the screen
        backgroundPosition: "center", // Centers the image
        color: "white",
        textAlign: "center",
        position: "relative", // To position buttons correctly over the image
      }}
    >
      <div
        style={{
          position: "absolute", // Positions the overlay on top of the image
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Adds a dark overlay for better readability
        }}
      ></div>

      <div style={{ marginTop: "30vh", zIndex: 10 }}> {/* Increased margin to move buttons further down */}
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
    </div>
  );
}

export default Landing;

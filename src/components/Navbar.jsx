import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useCallback } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    }
  }, [searchQuery, navigate]);

  return (
    <>
      <div
        style={{
          backgroundColor: "#1a1a1a",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
          {["Home", "Watchlist", "Watched"].map((item, index) => (
            <Link
              key={index}
              to={`/${item.toLowerCase()}`}
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "16px",
                transition: "text-shadow 0.3s ease-in-out",
                opacity: 0.8, // Reduce opacity to improve visual clarity
              }}
              onMouseEnter={(e) =>
                (e.target.style.textShadow = "0px 0px 15px rgba(255, 255, 255, 1)")
              }
              onMouseLeave={(e) => (e.target.style.textShadow = "none")}
            >
              {item}
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              color: "#ff4d4d",
              fontWeight: "bold",
              fontSize: "16px",
              padding: "8px 16px",
              border: "none",
              cursor: "pointer",
              background: "transparent",
              marginLeft: "40px",
              transition: "text-shadow 0.3s ease-in-out",
            }}
            onMouseEnter={(e) =>
              (e.target.style.textShadow = "0px 0px 15px rgba(255, 77, 77, 1)")
            }
            onMouseLeave={(e) => (e.target.style.textShadow = "none")}
          >
            Logout
          </button>
        </div>

        {/* Search Form - Only on Home Page */}
        {location.pathname === "/home" && (
          <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", marginRight: "40px" }}>
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "8px",
                fontSize: "14px",
                borderRadius: "4px 0 0 4px",
                border: "none",
                outline: "none",
                width: "180px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                backgroundColor: "#ff4d4d",
                color: "white",
                border: "none",
                borderRadius: "0 4px 4px 0",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </form>
        )}
      </div>

      {/* Spacer to push content below Navbar */}
      <div style={{ height: "64px" }}></div>
    </>
  );
}

export default Navbar;

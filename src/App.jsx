import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Import pages directly (no lazy loading)
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Watchlist from "./pages/Watchlist";
import Watched from "./pages/Watched";
import MovieDetails from "./pages/MovieDetails";
import Search from "./pages/Search"; // Import Search page

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const location = useLocation(); // Track current route

  return (
    <Routes location={location} key={location.pathname}> {/* 👈 Force reload */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/watchlist" element={<PrivateRoute><Watchlist /></PrivateRoute>} />
      <Route path="/watched" element={<PrivateRoute><Watched /></PrivateRoute>} />
      <Route path="/movie/:id" element={<PrivateRoute><MovieDetails /></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} /> {/* Added Search Route */}
    </Routes>
  );
}

export default App;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import React from "react";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
    } else {
      console.error("❌ No user_id found in localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
        );
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/tmdb/movie/${id}/providers`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setProviders(data); // Set the providers to the response data
        } else {
          setProviders([]); // Set an empty array if the response is not in the expected format
        }
      } catch (error) {
        console.error("Error fetching movie providers:", error);
        setProviders([]); // Fallback to empty array on error
      }
    };

    fetchProviders();
  }, [id]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  const addToWatchlist = async () => {
    if (!userId) return showNotification("❌ User not authenticated", "error");
    if (isInWatchlist) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://127.0.0.1:8000/watchlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          movie_id: parseInt(id),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add movie");
      showNotification("✅ Movie added to Watchlist!");
      setIsInWatchlist(true);
    } catch (error) {
      console.error("Error adding movie:", error);
      showNotification(error.message, "error");
    }
  };

  const markAsWatched = async () => {
    if (!userId) return showNotification("❌ User not authenticated", "error");
    if (isWatched) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://127.0.0.1:8000/watched/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          movie_id: parseInt(id),
          title: movie.title,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to mark as watched");
      showNotification("✅ Movie marked as Watched!");
      setIsWatched(true);
      setIsInWatchlist(false);
    } catch (error) {
      console.error("Error marking movie:", error);
      showNotification(error.message, "error");
    }
  };

  // Fallback image logic
  const getPosterImageUrl = (posterPath) => {
    if (posterPath) {
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }
    return "/noimage.jpg"; // Default fallback image
  };

  // Function to filter providers based on selected country
  const filteredProviders = providers.filter(providerGroup => providerGroup.country === selectedCountry);

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <div className="pt-20 px-6 flex flex-col lg:flex-row items-center lg:items-start lg:gap-10 max-w-4xl mx-auto">
        <div className="w-[200px] sm:w-[220px] md:w-[250px] lg:w-[280px] flex-shrink-0">
          <img
            src={getPosterImageUrl(movie?.poster_path)}
            alt={movie?.title}
            className="rounded-lg shadow-lg w-full h-auto"
          />
          {/* Notification message */}
          {notification && (
            <div
              className={`mt-2 text-center ${
                notification.type === "error" ? "text-red-500" : "text-green-500"
              }`}
            >
              {notification.message}
            </div>
          )}
        </div>

        <div className="flex-1 mt-6 lg:mt-0 text-left space-y-4">
          <h1 className="text-3xl font-bold">{movie?.title}</h1>
          {movie?.tagline && <p className="italic text-gray-400">{movie.tagline}</p>}
          <p className="text-gray-300 leading-relaxed">{movie?.overview}</p>
          <div className="text-gray-400 space-y-2">
            <p>
              <span className="font-bold text-white">Release Date:</span> {movie?.release_date}
            </p>
            <p>
              <span className="font-bold text-white">Runtime:</span> {movie?.runtime} mins
            </p>
            <p>
              <span className="font-bold text-white">Rating:</span> ⭐ {movie?.vote_average} / 10
            </p>
          </div>

          {/* Country Dropdown */}
          <div className="text-gray-400">
            <label className="font-bold text-white">Select Country:</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-black text-white border border-gray-400 p-2 rounded-md"
            >
              <option value="">All Countries</option>
              {providers.map((providerGroup, index) => (
                <option key={index} value={providerGroup.country}>
                  {providerGroup.country}
                </option>
              ))}
            </select>
          </div>

          {/* Display streaming providers based on the selected country */}
          {selectedCountry && filteredProviders.length > 0 && (
            <div className="text-gray-400">
              <h3 className="font-bold text-white">Available on:</h3>
              <ul className="space-y-2">
                {filteredProviders.map((providerGroup, index) => (
                  <li key={index}>
                    <strong>{providerGroup.country}</strong>:{" "}
                    {providerGroup.providers.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            {/* Watchlist Button */}
            <button
              onClick={addToWatchlist}
              disabled={isInWatchlist || isWatched}
              style={{
                padding: "12px 24px",
                background: isInWatchlist ? "#4A5568" : "linear-gradient(135deg, #6366F1, #3B82F6)",
                color: "white",
                fontWeight: "600",
                fontSize: "16px",
                border: "none",
                borderRadius: "10px",
                cursor: isInWatchlist || isWatched ? "not-allowed" : "pointer",
                transition: "transform 0.2s ease, box-shadow 0.3s ease",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "0px 4px 12px rgba(99, 102, 241, 0.3)",
                opacity: isInWatchlist || isWatched ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isInWatchlist && !isWatched) {
                  e.target.style.boxShadow = "0px 6px 18px rgba(99, 102, 241, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isInWatchlist && !isWatched) {
                  e.target.style.boxShadow = "0px 4px 12px rgba(99, 102, 241, 0.3)";
                }
              }}
            >
              {isInWatchlist ? "In Watchlist" : "Add To Watchlist"}
            </button>
            {/* Watched Button */}
            <button
              onClick={markAsWatched}
              disabled={isWatched}
              style={{
                padding: "12px 24px",
                background: isWatched ? "#4A5568" : "linear-gradient(135deg, #10B981, #059669)",
                color: "white",
                fontWeight: "600",
                fontSize: "16px",
                border: "none",
                borderRadius: "10px",
                cursor: isWatched ? "not-allowed" : "pointer",
                transition: "transform 0.2s ease, box-shadow 0.3s ease",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "0px 4px 12px rgba(16, 185, 129, 0.3)",
                opacity: isWatched ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isWatched) {
                  e.target.style.boxShadow = "0px 6px 18px rgba(16, 185, 129, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isWatched) {
                  e.target.style.boxShadow = "0px 4px 12px rgba(16, 185, 129, 0.3)";
                }
              }}
            >
              {isWatched ? "Watched" : "Mark As Watched"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;

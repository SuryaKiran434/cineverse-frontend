import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { assertMovieId } from "../utils/movieId";

function Watched() {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchWatched = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/watched", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch watched movies");
        }

        const data = await response.json();
        setMovies(data.watched);
      } catch (error) {
        console.error("Error fetching watched movies:", error);
      }
    };

    fetchWatched();
  }, [navigate]);

  const removeFromWatched = async (movieId) => {
    const token = localStorage.getItem("token");

    try {
      const safeMovieId = assertMovieId(movieId);
      const response = await fetch(`http://127.0.0.1:8000/watched/remove/${safeMovieId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to remove movie from watched list");
      }

      setMovies(movies.filter((movie) => movie.movie_id !== movieId));
    } catch (error) {
      console.error("Error removing movie:", error);
    }
  };

  const renderMovieRows = () => {
    const rows = [];
    for (let i = 0; i < movies.length; i += 5) {
      const rowMovies = movies.slice(i, i + 5);
      rows.push(
        <div key={i} className="grid grid-cols-5 gap-4 mb-8">
          {rowMovies.map((movie) => (
            <div key={movie.movie_id} className="flex flex-col items-center relative group">
              <Link to={`/movie/${movie.movie_id}`}>
                <img
                  src={movie.poster ? movie.poster : "/default_poster.jpg"}
                  alt={movie.title}
                  className="rounded-lg shadow-lg w-[180px] h-[270px] object-cover"
                />
              </Link>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2 flex justify-center">
                <button
                  onClick={() => removeFromWatched(movie.movie_id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition"
                >
                  Remove
                </button>
              </div>
              <p className="text-sm text-gray-300 mt-2 text-center truncate w-full">
                {movie.title}
              </p>
            </div>
          ))}
          {/* Add empty placeholders if the row is not full */}
          {Array(5 - rowMovies.length).fill().map((_, index) => (
            <div key={`empty-${index}`} className="w-[180px] h-[270px]" />
          ))}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="pt-20 px-6 bg-black min-h-screen text-white">
      <Navbar />
      <h2 className="text-2xl font-bold mb-6 text-center">Watched Movies</h2>
      {movies.length === 0 ? (
        <p className="text-gray-400 text-center">No movies in your watched list.</p>
      ) : (
        <div className="mt-4">
          {renderMovieRows()}
        </div>
      )}
    </div>
  );
}

export default Watched;

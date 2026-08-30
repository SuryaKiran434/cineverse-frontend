import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { assertMovieId } from "../utils/movieId";

const API_BASE = "http://127.0.0.1:8000";
const COLUMNS = 5;

/**
 * A grid of movie posters backed by one of the user's collections.
 *
 * Watchlist and Watched were byte-identical apart from five strings — the
 * endpoint, the response key, a heading, an empty-state line and the wording of
 * three error messages. Keeping two copies meant every fix had to be made twice
 * (and the `assertMovieId` guard genuinely was), so the behaviour lives here
 * once and the pages supply only what differs.
 *
 * @param {string} collection endpoint segment, also the key the list arrives
 *   under in the response body: `/watchlist` returns `{ watchlist: [...] }`
 * @param {string} title heading shown above the grid
 * @param {string} emptyMessage shown instead of the grid when nothing is stored
 * @param {string} label human-readable collection name, used in error messages
 */
function MovieCollectionPage({ collection, title, emptyMessage, label }) {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCollection = async () => {
      try {
        const response = await fetch(`${API_BASE}/${collection}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${label}`);
        }

        const data = await response.json();
        setMovies(data[collection] ?? []);
      } catch (error) {
        console.error(`Error fetching ${label}:`, error);
      }
    };

    fetchCollection();
  }, [navigate, collection, label]);

  const removeMovie = useCallback(
    async (movieId) => {
      const token = localStorage.getItem("token");

      try {
        // Validated before it reaches the path: an id is always a positive
        // integer, so nothing shaped like "../" can be interpolated here.
        const safeMovieId = assertMovieId(movieId);
        const response = await fetch(
          `${API_BASE}/${collection}/remove/${safeMovieId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to remove movie from ${label}`);
        }

        setMovies((current) =>
          current.filter((movie) => movie.movie_id !== movieId)
        );
      } catch (error) {
        console.error("Error removing movie:", error);
      }
    },
    [collection, label]
  );

  const renderMovieRows = () => {
    const rows = [];
    for (let i = 0; i < movies.length; i += COLUMNS) {
      const rowMovies = movies.slice(i, i + COLUMNS);
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
                  onClick={() => removeMovie(movie.movie_id)}
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
          {/* Pad the final row so the grid keeps its column widths. */}
          {Array(COLUMNS - rowMovies.length).fill().map((_, index) => (
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
      <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      {movies.length === 0 ? (
        <p className="text-gray-400 text-center">{emptyMessage}</p>
      ) : (
        <div className="mt-4">{renderMovieRows()}</div>
      )}
    </div>
  );
}

export default MovieCollectionPage;

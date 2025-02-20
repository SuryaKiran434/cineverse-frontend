import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import React from "react";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function Home() {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
        );
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMoviesForGenres = async () => {
      try {
        const moviesData = {};
        const movieRequests = genres.map(async (genre) => {
          const randomPage = Math.floor(Math.random() * 10) + 1;
          const response = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genre.id}&page=${randomPage}`
          );
          const data = await response.json();
          moviesData[genre.id] = data.results.slice(0, 10);
        });

        await Promise.all(movieRequests);
        setMoviesByGenre(moviesData);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    if (genres.length > 0) {
      fetchMoviesForGenres();
    }
  }, [genres]);

  // Fetch Recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/recommendations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loadingGenres) {
    return <div className="text-center text-lg mt-20">Loading genres...</div>;
  }

  return (
    <div className="bg-black min-h-screen">
      <Navbar />

      <div className="bg-black min-h-screen px-6" style={{ paddingTop: "32px" }}>
        {/* Recommendations Section */}
        {loadingRecommendations ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Recommendations</h2>
            <div className="flex justify-center items-center">
              <div className="spinner-border animate-spin h-8 w-8 border-4 border-blue-500 rounded-full"></div>
            </div>
          </div>
        ) : (
          recommendations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Recommendations</h2>
              <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                  {recommendations.map((movie) => (
                    <Link
                      key={movie.movie_id}
                      to={`/movie/${movie.movie_id}`}
                      className="flex-none w-[160px] transition-transform duration-300 hover:scale-105 cursor-pointer"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-[240px] object-cover rounded-sm"
                      />
                      <p className="text-sm text-gray-300 mt-2 truncate">{movie.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )
        )}

        {/* Genres Section */}
        {genres.map((genre) => (
          <div key={genre.id} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">{genre.name}</h2>
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {moviesByGenre[genre.id]?.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    className="flex-none w-[160px] transition-transform duration-300 hover:scale-105 cursor-pointer"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-[240px] object-cover rounded-sm"
                    />
                    <p className="text-sm text-gray-300 mt-2 truncate">{movie.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;

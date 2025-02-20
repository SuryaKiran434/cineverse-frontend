import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";

const Search = () => {
  const location = useLocation();
  const queryFromUrl = new URLSearchParams(location.search).get("query");
  const [query, setQuery] = useState(queryFromUrl || "");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (queryFromUrl) {
      handleSearch(queryFromUrl);
    }
  }, [queryFromUrl]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery) return;

    setLoading(true);
    setError(null);

    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await axios.get(`http://127.0.0.1:8000/tmdb/search?query=${encodedQuery}`);
      setMovies(response.data.results);
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearchButtonClick = () => {
    handleSearch(query);
  };

  const getPosterImageUrl = (posterPath) => {
    if (posterPath) {
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }
    return "/noimage.jpg";
  };

  const renderMovieRows = () => {
    const rows = [];
    for (let i = 0; i < movies.length; i += 4) {
      const rowMovies = movies.slice(i, i + 4);
      rows.push(
        <div key={i} className="grid grid-cols-4 gap-4 mb-8">
          {rowMovies.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="flex flex-col items-center"
            >
              <img
                src={getPosterImageUrl(movie.poster_path)}
                alt={movie.title}
                className="rounded-lg shadow-lg w-[200px] h-[300px] object-cover"
              />
              <p className="text-sm text-gray-300 mt-2 text-center truncate w-full">
                {movie.title}
              </p>
            </Link>
          ))}
          {/* Add empty placeholders if the row is not full */}
          {Array(4 - rowMovies.length).fill().map((_, index) => (
            <div key={`empty-${index}`} className="w-[200px] h-[300px]" />
          ))}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <input
        type="text"
        placeholder="Search for a movie..."
        value={query}
        onChange={handleInputChange}
        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
      />
      <button
        onClick={handleSearchButtonClick}
        className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded"
      >
        Search
      </button>

      {loading && <p className="text-white mt-2">Loading...</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-4">
        {movies.length === 0 && !loading && !error && (
          <p className="text-gray-400">No results found</p>
        )}
        {movies.length > 0 && renderMovieRows()}
      </div>
    </div>
  );
};

export default Search;

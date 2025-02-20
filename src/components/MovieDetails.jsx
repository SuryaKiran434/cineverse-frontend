import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import React from "react";

const MovieDetails = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        // Fetch movie details
        fetch(`http://127.0.0.1:8000/tmdb/movie/${id}`)
            .then(response => response.json())
            .then(data => setMovie(data))
            .catch(error => console.error("Error fetching movie details:", error));
    }, [id]);

    if (!movie) return <p>Loading...</p>;

    return (
        <div>
            <h1>{movie.title}</h1>
            <p>{movie.overview}</p>
            <p><strong>Status:</strong> {movie.status}</p>
            <p><strong>Rating:</strong> {movie.vote_average} ({movie.vote_count} votes)</p>

            <h2>Production Companies:</h2>
            <ul>
                {movie.production_companies.map((company, index) => (
                    <li key={index}>{company.name}</li>
                ))}
            </ul>

            <h2>Languages:</h2>
            <ul>
                {movie.spoken_languages.map((lang, index) => (
                    <li key={index}>{lang.english_name}</li>
                ))}
            </ul>
        </div>
    );
};

export default MovieDetails;

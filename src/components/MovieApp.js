import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AiOutlineSearch } from 'react-icons/ai';
import './MovieApp.css';

const fetchData = async (url, params) => {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

const MovieCard = React.memo(({ movie, expandedMovieId, toggleDescription }) => (
  <div className="movie">
    <img
      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
      alt={movie.title}
    />
    <h2>{movie.title}</h2>
    <p className="rating">Rating: {movie.vote_average}</p>
    {expandedMovieId === movie.id ? (
      <p>{movie.overview}</p>
    ) : (
      <p>{movie.overview.substring(0, 150)}...</p>
    )}
    <button
      onClick={() => toggleDescription(movie.id)}
      className="read-more"
    >
      {expandedMovieId === movie.id ? 'Show Less' : 'Read More'}
    </button>
  </div>
));

const MovieRecommendations = () => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [expandedMovieId, setExpandedMovieId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await fetchData('https://api.themoviedb.org/3/genre/movie/list', {
          api_key: '0fa2853e7c4d6c8f146aba861c5e4a06',
        });
        setGenres(data.genres);
      } catch (err) {
        setError('Failed to load genres.');
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const data = await fetchData('https://api.themoviedb.org/3/discover/movie', {
          api_key: '0fa2853e7c4d6c8f146aba861c5e4a06',
          sort_by: sortBy,
          page: currentPage,
          with_genres: selectedGenre,
          query: searchQuery,
        });
        setMovies(data.results);
        setError(null);
      } catch (err) {
        setError('Failed to load movies.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, [searchQuery, sortBy, selectedGenre, currentPage]);

  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter') setCurrentPage(1); // Reset to page 1 on search
  };

  const handleSortChange = (event) => setSortBy(event.target.value);

  const handleGenreChange = (event) => setSelectedGenre(event.target.value);

  const toggleDescription = (movieId) =>
    setExpandedMovieId(expandedMovieId === movieId ? null : movieId);

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => Math.max(1, prev + direction));
  };

  return (
    <div>
      <h1>Movies of the yeat</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleSearchSubmit}
          className="search-input"
        />
        <button
          className="search-button"
          onClick={() => setCurrentPage(1)} // Reset to page 1 on search button click
        >
          <AiOutlineSearch />
        </button>
      </div>
      <div className="filters">
        <label htmlFor="sort-by">Sort By:</label>
        <select id="sort-by" value={sortBy} onChange={handleSortChange}>
          <option value="popularity.desc">Popularity Descending</option>
          <option value="popularity.asc">Popularity Ascending</option>
          <option value="vote_average.desc">Rating Descending</option>
          <option value="vote_average.asc">Rating Ascending</option>
          <option value="release_date.desc">Release Date Descending</option>
          <option value="release_date.asc">Release Date Ascending</option>
        </select>
        <label htmlFor="genre">Genre:</label>
        <select id="genre" value={selectedGenre} onChange={handleGenreChange}>
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="movie-wrapper">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              expandedMovieId={expandedMovieId}
              toggleDescription={toggleDescription}
            />
          ))}
        </div>
      )}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(-1)}
          disabled={currentPage === 1}>
          Previous
        </button>
        <span> {currentPage}</span>
        <button onClick={() => handlePageChange(1)}>Next</button>
      </div>
    </div>
  );
};

export default MovieRecommendations;

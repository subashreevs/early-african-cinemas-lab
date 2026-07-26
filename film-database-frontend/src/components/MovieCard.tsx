import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MovieCard.css';
import movie_poster from '../assets/movie_poster.jpg';
import LoginModal from './LoginModal';
import { ENDPOINTS } from '../api/endpoints';

interface Movie {
  id: string;
  title: string;
  year: number;
  posterUrl: string;
}

interface MovieCardProps {
  movie: Movie;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleClick = () => {
    if (isLoggedIn) {
      // User is logged in; navigate to the movie details page.
      navigate(`/movie/${movie.id}`);
    } else {
      // Not logged in; display the login modal.
      setShowLoginModal(true);
    }
  };

  // This function is called when the login process completes successfully.
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Update the global authentication state.
    setIsLoggedIn(true);
    // After successful login, navigate to the movie details page.
    navigate(`/movie/${movie.id}`);
  };

  const handleCancelLogin = () => {
    setShowLoginModal(false);
  };

  return (
    <>
      <div className="movie-card" onClick={handleClick}>
            <img
        src={movie?.posterUrl || movie_poster }
        alt={movie.title}
        className="movie-poster"
        onError={(e) => {
          e.currentTarget.src = movie_poster; // fallback to default
        }}
      />

        <div className="movie-overlay">
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-year">{movie.year}</p>
        </div>
      </div>
      {showLoginModal && (
        <LoginModal 
          onLoginSuccess={handleLoginSuccess} 
          onReturnHome={handleCancelLogin} 
        />
      )}
    </>
  );
};

export default MovieCard;

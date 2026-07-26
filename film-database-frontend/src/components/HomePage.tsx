// src/components/HomePage.tsx

import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import MovieCard from './MovieCard';
import NotificationPopup from './NotificationPopup';
import { fetchMovies, fetchFullFilms } from '../api/client';
import Loader from './Loader';
import movie_poster from '../assets/movie_poster.jpg';

interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  genre: string;
  posterUrl: string;
}

interface Notification {
  message: string;
}

const HomePage: React.FC<{ isLoggedIn: boolean; setIsLoggedIn: (v: boolean) => void }> = ({
  isLoggedIn,
  setIsLoggedIn,
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'year' | 'genre' | 'popularity'>('year');
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState<Notification | null>(null);
  const moviesPerPage = 12;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchMovies()
      .then((data) => {
        const fetched: Movie[] = data.films.map((film: any) => ({
          id: film.film_id.toString(),
          title: film.title,
          year: film.release_year,
          director: film.director || 'Unknown Director',
          genre: film.genre || 'Drama',
          posterUrl: film.posterUrl || ''
                }));
        setMovies(fetched);
      })
      .catch((err) => {
        console.error('Error fetching films:', err);
        setNotification({ message: 'Failed to load movies.' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleExportCSV = async () => {
    if (!isLoggedIn) {
      setNotification({ message: 'You must be logged in to export data.' });
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setNotification({ message: 'Authentication token missing. Please log in.' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchFullFilms(token);
      const flat = data.films.map((film: any) => {
        const authorMap: Record<string, string> = {};
        ;(film.authors || []).forEach((a: any) => {
          if (a.role && a.name) {
            authorMap[a.role.toLowerCase().replace(/\s+/g, '_')] = a.name;
          }
        });

        const teamMap: Record<string, string> = {};
        ;(film.team || []).forEach((t: any) => {
          if (t.department && t.name) {
            const key = t.department.toLowerCase().replace(/\s+/g, '_');
            teamMap[key] = teamMap[key] ? `${teamMap[key]}; ${t.name}` : t.name;
          }
        });

        const fmt = (label: string, lines: string[]) =>
          lines.length
            ? `${label}:\n- ${lines.join('\n- ')}`
            : `${label}:\n(none)`;

        return {
          film_id: film.film_id,
          title: film.title,
          release_year: film.release_year,
          runtime: film.runtime,
          synopsis: film.synopsis,
          link: film.link,
          ...authorMap,
          ...teamMap,
          Actors: fmt(
            'Actors',
            (film.actors || []).map(
              (a: any) => a.actor_name + (a.character_name ? ` as ${a.character_name}` : '')
            )
          ),
          Equipment: fmt(
            'Equipment',
            (film.equipment || []).map((e: any) =>
              e.equipment_name + (e.description ? ` (${e.description})` : '')
            )
          ),
          Documents: fmt(
            'Documents',
            (film.documents || []).map((d: any) => `${d.document_type}: ${d.file_url}`)
          ),
          Institutions: fmt(
            'Institutions',
            (film.institutional_info || []).map(
              (i: any) => `${i.production_company} / ${i.funding_company}`
            )
          ),
          Screenings: fmt(
            'Screenings',
            (film.screenings || []).map(
              (s: any) => `${s.screening_date} - ${s.organizers} (${s.format})`
            )
          ),
        };
      });

      const headers = Object.keys(flat[0] || {});
      const csvRows = [
        headers.join(','),
        ...flat.map((row: any) =>
          headers
            .map((key) => `"${(row[key] ?? '').toString().replace(/"/g, '""')}"`)
            .join(',')
        ),
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'films_full_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Export failed:', err);
      setNotification({ message: 'Failed to export CSV.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter, sort, paginate
  const filtered = movies.filter((m) =>
    [m.title, m.director, m.genre, m.year.toString()].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const sorted = filtered.sort((a, b) => {
    if (sortOption === 'year') return a.year - b.year;
    if (sortOption === 'genre') return a.genre.localeCompare(b.genre);
    return a.id.localeCompare(b.id);
  });
  const totalPages = Math.ceil(sorted.length / moviesPerPage);
  const currentMovies = sorted.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage
  );

  return (
    <div className="home-page">
      {isLoading && <Loader />}
      {notification && (
        <NotificationPopup message={notification.message} onClose={() => setNotification(null)} />
      )}

      <div className="search-sort">
        <input
          className="search-input"
          placeholder="Search by title, director, genre, or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="export-btn" onClick={handleExportCSV}>
          Export as CSV
        </button>
      </div>

      <div className="movie-grid">
        {currentMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />
        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;

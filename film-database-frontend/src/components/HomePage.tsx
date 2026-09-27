// src/components/HomePage.tsx

import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import MovieCard from './MovieCard';
import NotificationPopup from './NotificationPopup';
import { fetchMovies, fetchFullFilms } from '../api/client';
import Loader from './Loader';

interface Movie {
  id: string;
  title: string;
  year: number | null;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState<Notification | null>(null);
  const moviesPerPage = 12;
  const [isLoading, setIsLoading] = useState(false);

  const updateSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchMovies()
      .then((data) => {
        const fetched: Movie[] = data.films.map((film: any) => ({
          id: film.film_id.toString(),
          title: film.title,
          year: film.release_year ?? null,
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

  // Filter and paginate in the order returned by the film API.
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filtered = movies.filter((m) =>
    [m.title, m.director, m.genre, m.year].some((field) =>
      String(field ?? '').toLowerCase().includes(normalizedSearch)
    )
  );
  const totalPages = Math.ceil(filtered.length / moviesPerPage);
  const currentMovies = filtered.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage
  );

  return (
    <div className="home-page">
      {isLoading && <Loader />}
      {notification && (
        <NotificationPopup message={notification.message} onClose={() => setNotification(null)} />
      )}

      <header className="catalog-hero">
        <div className="hero-copy">
          <p className="eyebrow">Early African Cinemas Lab</p>
          <h1>Discover early African film histories.</h1>
          <p className="hero-description">
            Films, people, screenings, and archival materials.
          </p>
        </div>
        <div className="catalog-stat" aria-label={`${movies.length} films in the database`}>
          <strong>{movies.length}</strong>
          <span>film records</span>
        </div>
      </header>
      <section className="catalog-section" aria-labelledby="collection-heading">
        <div className="section-heading">
          <div>
            <h2 id="collection-heading" className="section-title">The Collection</h2>
          </div>
          <p className="result-count" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
          </p>
        </div>
        <div className="search-sort">
          <label className="search-field">
            <span className="sr-only">Search the film database</span>
            <span className="search-icon" aria-hidden="true" />
            <input className="search-input" type="search" placeholder="Search films, directors, genres, or years" value={searchTerm} onChange={(e) => updateSearch(e.target.value)} />
          </label>
          <button className="export-btn" onClick={handleExportCSV}><span aria-hidden="true">↓</span> Export CSV</button>
        </div>
        {currentMovies.length ? (
          <div className="movie-grid">
            {currentMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            ))}
          </div>
        ) : !isLoading && (
          <div className="empty-state">
            <span aria-hidden="true">⌕</span>
            <h3>No films found</h3>
            <p>Try a different title, director, genre, or year.</p>
            <button onClick={() => updateSearch('')}>Clear search</button>
          </div>
        )}
        {totalPages > 1 && (
          <nav className="pagination" aria-label="Film Database pages">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)} aria-current={currentPage === i + 1 ? 'page' : undefined} aria-label={`Page ${i + 1}`}>{i + 1}</button>
            ))}
          </nav>
        )}
      </section>
    </div>
  );
};

export default HomePage;

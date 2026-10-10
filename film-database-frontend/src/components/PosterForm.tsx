import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../api/endpoints';
import '../styles/AttachmentsForms.css';

interface PosterFormProps {
  filmId: string;
}

const MAX_POSTER_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const PosterForm: React.FC<PosterFormProps> = ({ filmId }) => {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchPoster = useCallback(async () => {
    try {
      const { data } = await axios.get(ENDPOINTS.GET_POSTER(filmId));
      setPosterUrl(data.url || null);
    } catch {
      setError('The poster could not be loaded. Please try again.');
    }
  }, [filmId]);

  useEffect(() => {
    fetchPoster();
  }, [fetchPoster]);

  const selectFile = (selected: File | null) => {
    setError('');
    setMessage('');
    setFile(null);
    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (selected.size > MAX_POSTER_BYTES) {
      setError('Choose an image that is 5 MB or smaller.');
      return;
    }
    setFile(selected);
  };

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const form = new FormData();
      form.append('poster', file);
      const { data } = await axios.post(ENDPOINTS.UPLOAD_POSTER(filmId), form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      setPosterUrl(data.url);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setMessage('Poster saved.');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'The poster could not be saved.');
      } else {
        setError('The poster could not be saved.');
      }
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.delete(ENDPOINTS.DELETE_POSTER(filmId), {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      setPosterUrl(null);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setMessage('Poster removed.');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'The poster could not be removed.');
      } else {
        setError('The poster could not be removed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="poster-form">
      <h3>Poster</h3>
      {posterUrl ? (
        <img className="poster-preview" src={posterUrl} alt="Current film poster" />
      ) : (
        <p className="attachment-empty-state">No poster has been added.</p>
      )}
      <label htmlFor="poster-file">Poster image (JPEG, PNG, or WebP, up to 5 MB)</label>
      <input
        ref={inputRef}
        id="poster-file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={loading}
        onChange={(event) => selectFile(event.target.files?.[0] || null)}
      />
      <div className="poster-actions">
        <button type="button" disabled={!file || loading} onClick={upload}>
          {loading ? 'Saving...' : posterUrl ? 'Replace Poster' : 'Upload Poster'}
        </button>
        {posterUrl && (
          <button type="button" disabled={loading} onClick={remove}>Remove Poster</button>
        )}
      </div>
      {error && <p className="poster-error" role="alert">{error}</p>}
      {message && <p className="poster-message" role="status">{message}</p>}
    </div>
  );
};

// src/components/PosterForm.tsx
import React, { useState, useEffect } from 'react'
import { ENDPOINTS } from '../api/endpoints'
import axios from 'axios'
import '../styles/AttachmentsForms.css'

interface PosterFormProps {
  filmId: string
}

export const PosterForm: React.FC<PosterFormProps> = ({ filmId }) => {
  const [posterUrl, setPosterUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchPoster = async () => {
    try {
      const { data } = await axios.get(ENDPOINTS.GET_POSTER(filmId))
      setPosterUrl(data.url)
    } catch (e) {
      setPosterUrl(null)
    }
  }

  useEffect(() => {
    fetchPoster()
  }, [filmId])

  const upload = async () => {
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('poster', file)
    const { data } = await axios.post(
      ENDPOINTS.UPLOAD_POSTER(filmId),
      form,
      {           headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    }
    )
    setPosterUrl(data.poster_url)
    setFile(null)
    setLoading(false)
  }

  const remove = async () => {
    setLoading(true)
    await axios.delete(
      ENDPOINTS.DELETE_POSTER(filmId),
      {           headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    }
    )
    setPosterUrl(null)
    setLoading(false)
  }

  return (
    <div className="poster-form">
      <h3>Poster</h3>
      {posterUrl ? (
        <>
          <img src={posterUrl} alt="Poster" style={{ maxWidth: 200 }}/>
          <button disabled={loading} onClick={remove}>Remove</button>
        </>
      ) : (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
          <button disabled={!file || loading} onClick={upload}>
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </>
      )}
    </div>
  )
}

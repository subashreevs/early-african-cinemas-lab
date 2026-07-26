// src/components/GalleryForm.tsx
import React, { useState, useEffect } from 'react'
import { ENDPOINTS } from '../api/endpoints'
import axios from 'axios'
import '../styles/AttachmentsForms.css'

interface GalleryImage {
  imageId: number
  url: string
}

interface GalleryFormProps {
  filmId: string
}

export const GalleryForm: React.FC<GalleryFormProps> = ({ filmId }) => {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchGallery = async () => {
    try {
      const { data } = await axios.get(ENDPOINTS.GET_GALLERY(filmId))
      setImages(data.images)
    } catch (e) {
      setImages([])
    }
  }

  useEffect(() => {
    fetchGallery()
  }, [filmId])

  const upload = async () => {
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('image', file)
    const { data } = await axios.post(
      ENDPOINTS.UPLOAD_IMAGE(filmId),
      form,
      {           headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    }
    )
    setImages([...images, { imageId: data.image_id, url: data.url }])
    setFile(null)
    setLoading(false)
  }

  const remove = async (imageId: number) => {
    setLoading(true)
    await axios.delete(
      ENDPOINTS.DELETE_IMAGE(filmId, imageId),
      { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}`} }
    )
    setImages(images.filter(img => img.imageId !== imageId))
    setLoading(false)
  }

  return (
    <div className="gallery-form">
      <h3>Gallery (max 3)</h3>
      <div className="thumbs">
        {images.map(img => (
          <div key={img.imageId}>
            <img src={img.url} alt="" style={{ width: 100 }}/>
            <button disabled={loading} onClick={() => remove(img.imageId)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      {images.length < 3 && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.currentTarget.files?.[0] || null)}
          />
          <button disabled={!file || loading} onClick={upload}>
            {loading ? 'Uploading…' : 'Upload new'}
          </button>
        </>
      )}
    </div>
  )
}

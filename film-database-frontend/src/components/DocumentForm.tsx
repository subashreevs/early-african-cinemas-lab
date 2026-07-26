// src/components/DocumentsForm.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ENDPOINTS } from '../api/endpoints'
import '../styles/AttachmentsForms.css'


interface Doc {
  documentId: number
  filename: string
  url: string
  contentType: string
}

interface DocumentsFormProps {
  filmId: string
}

export const DocumentsForm: React.FC<DocumentsFormProps> = ({ filmId }) => {
  const [docs, setDocs] = useState<Doc[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchDocs = async () => {
    try {
      const { data } = await axios.get(
        ENDPOINTS.GET_DOCUMENTS(filmId),
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      )
      setDocs(data.documents)
    } catch {
      setDocs([])
    }
  }

  useEffect(() => { fetchDocs() }, [filmId])

  const upload = async () => {
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('document', file)
    const { data } = await axios.post(
      ENDPOINTS.UPLOAD_DOCUMENT(filmId),
      form,
      { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
    )
    setDocs([
      ...docs,
      {
        documentId: data.documentId,
        filename:   data.filename,
        contentType:data.contentType,
        url:        data.url
      }
    ])
    setFile(null)
    setLoading(false)
  }

  const remove = async (id: number) => {
    setLoading(true)
    await axios.delete(
      ENDPOINTS.DELETE_DOCUMENT(filmId, id),
      { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
    )
    setDocs(docs.filter(d => d.documentId !== id))
    setLoading(false)
  }

  return (
    <div className="documents-form">
      <h3>Documents</h3>
      <ul className="doc-list">
        {docs.map(d => (
          <li key={d.documentId} className="doc-item">
            <a href={d.url} target="_blank" rel="noopener noreferrer">
              📄 {d.filename}
            </a>
            <button
              disabled={loading}
              onClick={() => remove(d.documentId)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="doc-upload">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={e => setFile(e.currentTarget.files?.[0] || null)}
        />
        <button
          disabled={!file || loading}
          onClick={upload}
        >
          {loading ? 'Uploading…' : 'Upload New Document'}
        </button>
      </div>
    </div>
  )
}

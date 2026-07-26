// src/components/AdminFilms.tsx

import React, { useState, useEffect } from 'react';
import { FormikHelpers } from 'formik';

import '../styles/AdminFilms.css';
import NotificationPopup from './NotificationPopup';
import { apiFetch } from '../apifetch';
import ConfirmationDialog from './ConfirmationDialog';
import { ENDPOINTS } from '../api/endpoints';
import movie_poster from '../assets/movie_poster.jpg';
import Loader from './Loader';

import { FilmFormData, FilmListItem } from './types';
import { initialValues as addInitialValues } from './FilmFormConstants';
import FilmFormWrapper from './FilmFormWrapper';
import AddAttachments from './AddAttachments';

const AdminFilms: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'update' | 'delete'>('add');
  const [message, setMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteSearchTerm, setDeleteSearchTerm] = useState('');
  const [filmIdToDelete, setFilmIdToDelete] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [films, setFilms] = useState<FilmListItem[]>([]);
  const [selectedFilmId, setSelectedFilmId] = useState<string>('');
  const [updateInitialValues, setUpdateInitialValues] = useState<FilmFormData | null>(null);
  const [showAttachments, setShowAttachments] = useState(false);

  // Load list of films
  const loadFilmsList = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(ENDPOINTS.MOVIES_LIST, {
        headers: {
          Authorization: localStorage.getItem('accessToken')
            ? `Bearer ${localStorage.getItem('accessToken')}`
            : '',
        },
      });
      if (!res.ok) {
        setMessage('Failed to load films list');
        return;
      }
      const data = await res.json();
      setFilms(data.films);
    } catch (err: any) {
      setMessage('Error loading films: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load a single film’s data for editing
  const loadFilmData = async (filmId: number) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(ENDPOINTS.MOVIE_DETAILS(filmId.toString()), {
        headers: {
          Authorization: localStorage.getItem('accessToken')
            ? `Bearer ${localStorage.getItem('accessToken')}`
            : '',
        },
      });
      if (!res.ok) {
        setMessage('Failed to load film data');
        return;
      }
      const filmData = await res.json();
      // build formData...
      const formData: FilmFormData = {
        title: filmData.film.title || '',
        release_year: filmData.film.release_year || null,
        runtime: filmData.film.runtime || '',
        synopsis: filmData.film.synopsis || '',
        av_annotate_link: filmData.film.av_annotate_link || '',
        posterFile: null,
        imageFiles: [],
        wantsMoreImages: false,
        wantsPoster: false,
        filmDocument: null,
        productionDetails: {
          production_timeframe: filmData.productionDetails.production_timeframe || '',
          shooting_city: filmData.productionDetails.shooting_city || '',
          shooting_country: filmData.productionDetails.shooting_country || '',
          post_production_studio: filmData.productionDetails.post_production_studio || '',
          production_comments: filmData.productionDetails.production_comments || '',
        },
        authors: {
          screenwriter: filmData.authors.find((a:any)=>a.role==='Screenwriter')?.name||'',
          screenwriter_comment: filmData.authors.find((a:any)=>a.role==='Screenwriter')?.comment||'',
          filmmaker: filmData.authors.find((a:any)=>a.role==='Filmmaker')?.name||'',
          filmmaker_comment: filmData.authors.find((a:any)=>a.role==='Filmmaker')?.comment||'',
          executive_producer: filmData.authors.find((a:any)=>a.role==='Executive Producer')?.name||'',
          executive_producer_comment: filmData.authors.find((a:any)=>a.role==='Executive Producer')?.comment||'',
        },
        productionTeam: filmData.productionTeam.length
          ? filmData.productionTeam
          : [{ department:'', name:'', role:'', comment:'' }],
        actors: filmData.actors.map((a:any)=>a.actor_name).join(', ') || '',
        equipment: filmData.equipment[0] || { equipment_name:'', description:'', comment:'' },
        documents: filmData.documents[0] || { document_type:'', file_url:'', comment:'' },
        institutionalInfo: {
          production_company: filmData.institutionalInfo.production_company || '',
          funding_company: filmData.institutionalInfo.funding_company || '',
          funding_comment: filmData.institutionalInfo.funding_comment || '',
          source: filmData.institutionalInfo.source || '',
          institutional_city: filmData.institutionalInfo.institutional_city || '',
          institutional_country: filmData.institutionalInfo.institutional_country || '',
        },
        screenings: filmData.screenings.length
          ? filmData.screenings.map((s:any)=>({
              screening_date: s.screening_date.split('T')[0]||'',
              screening_city: s.screening_city||'',
              screening_country: s.screening_country||'',
              organizers: s.organizers||'',
              format: s.format||'',
              audience: s.audience||'',
              film_rights: s.film_rights||'',
              comment: s.comment||'',
              source: s.source||'',
            }))
          : [{ screening_date:'', screening_city:'', screening_country:'', organizers:'', format:'', audience:'', film_rights:'', comment:'', source:'' }],
      };
      setUpdateInitialValues(formData);
    } catch (err:any) {
      setMessage('Error loading film data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a film
  const doDelete = async () => {
    if (!filmIdToDelete) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(ENDPOINTS.MOVIE_DETAILS(filmIdToDelete.toString()), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!res.ok) {
        setMessage('Failed to delete film');
      } else {
        setMessage('Film deleted successfully!');
        loadFilmsList();
      }
    } catch (err:any) {
      setMessage('Error deleting film: ' + err.message);
    } finally {
      setShowConfirm(false);
      setFilmIdToDelete(null);
      setIsLoading(false);
    }
  };

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e:BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Reset when switching tabs
  useEffect(() => {
    if (activeTab !== 'add') loadFilmsList();
    setUpdateInitialValues(null);
    setSelectedFilmId('');
    setShowAttachments(false);
    setMessage('');
    setIsDirty(false);
    setSearchTerm('');
    setDeleteSearchTerm('');
    setShowConfirm(false);
    setFilmIdToDelete(null);
  }, [activeTab]);

  // Create new film
  const onAddSubmit = async (values:FilmFormData, actions:FormikHelpers<FilmFormData>) => {
    setIsLoading(true);
    try {
      const payload = { ...values };
      delete payload.posterFile;
      delete payload.imageFiles;
      delete payload.filmDocument;

      const res = await apiFetch(ENDPOINTS.MOVIES_LIST, {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          Authorization:`Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || 'Submission error');
        return;
      }
      const { film_id } = await res.json();

      // Upload document if present
      if (values.filmDocument) {
        const fd = new FormData();
        fd.append('document', values.filmDocument);
        await fetch(ENDPOINTS.UPLOAD_DOCUMENT(film_id.toString()), {
          method:'POST',
          body:fd,
          headers:{ Authorization:`Bearer ${localStorage.getItem('accessToken')}` }
        });
      }

      setMessage('Film added successfully!');
      actions.resetForm({ values: addInitialValues });
      setIsDirty(false);
    } catch (err:any) {
      setMessage(err.message);
    } finally {
      actions.setSubmitting(false);
      setIsLoading(false);
    }
  };

  // Update existing film
  const onUpdateSubmit = async (values:FilmFormData, actions:FormikHelpers<FilmFormData>) => {
    if (!selectedFilmId) return;
    setIsLoading(true);
    try {
      const payload = { ...values };
      delete payload.posterFile;
      delete payload.imageFiles;
      delete payload.filmDocument;

      const res = await apiFetch(ENDPOINTS.MOVIE_DETAILS(selectedFilmId), {
        method:'PUT',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      // Upload document if new
      if (values.filmDocument instanceof File) {
        const fd = new FormData();
        fd.append('document', values.filmDocument);
        await fetch(ENDPOINTS.UPLOAD_DOCUMENT(selectedFilmId), {
          method:'POST',
          body:fd,
          headers:{ Authorization:`Bearer ${localStorage.getItem('accessToken')}` }
        });
      }

      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || 'Update error');
      } else {
        setMessage('Film updated successfully!');
      }

      loadFilmsList();
      setUpdateInitialValues(null);
      setSelectedFilmId('');
      setIsDirty(false);
    } catch (err:any) {
      setMessage(err.message);
    } finally {
      actions.setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      {isLoading && <Loader />}
      <div className="admin-tabs">
        <button
          className={activeTab==='add'?'active':''}
          onClick={()=>setActiveTab('add')}
        >Add Film</button>
        <button
          className={activeTab==='update'?'active':''}
          onClick={()=>setActiveTab('update')}
        >Update Film</button>
        <button
          className={activeTab==='delete'?'active':''}
          onClick={()=>setActiveTab('delete')}
        >Delete Film</button>
      </div>

      {message && (
        <NotificationPopup
          message={message}
          onClose={()=>setMessage('')}
        />
      )}

      <div className="admin-content">
        {activeTab==='add' && (
          <FilmFormWrapper
            initialVals={addInitialValues}
            onSubmit={onAddSubmit}
            setIsDirty={setIsDirty}
          />
        )}

        {activeTab==='update' && (
          <div className="update-section">
            {!updateInitialValues && !showAttachments ? (
              <>
                <input
                  type="text"
                  placeholder="Search by movie title..."
                  value={searchTerm}
                  onChange={e=>setSearchTerm(e.target.value)}
                  className="search-bar"
                />
                <ul className="films-list">
                  {films
                    .filter(f=>f.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(f=>(
                      <li key={f.film_id}>
                        <img
                          src={f?.posterUrl || movie_poster}
                          alt={f.title}
                          onError={e=>{e.currentTarget.src=movie_poster}}
                          style={{width:180,borderRadius:6,marginRight:8}}
                        />
                        <span>{f.title}</span>
                        <div className="btn-group">

                        <button
                          className="btn-edit"
                          onClick={()=>{
                            setSelectedFilmId(f.film_id.toString());
                            loadFilmData(f.film_id);
                            setShowAttachments(false);
                          }}
                        >Update Details</button>

                        <button
                          className="btn-attach"
                          onClick={()=>{
                            setSelectedFilmId(f.film_id.toString());
                            setShowAttachments(true);
                          }}
                        >Update Attachments</button>
                        </div>
                      </li>
                    ))}
                </ul>
              </>
            ) : showAttachments ? (
              <AddAttachments filmId={selectedFilmId}   onBack={() => setShowAttachments(false)}
/>
            ) : (
              <FilmFormWrapper
                initialVals={updateInitialValues!}
                onSubmit={onUpdateSubmit}
                setIsDirty={setIsDirty}
              />
            )}
          </div>
        )}

        {activeTab==='delete' && (
          <div className="delete-section">
            <input
              type="text"
              placeholder="Search by movie title..."
              value={deleteSearchTerm}
              onChange={e=>setDeleteSearchTerm(e.target.value)}
              className="search-bar"
            />
            <ul className="films-list">
              {films
                .filter(f=>f.title.toLowerCase().includes(deleteSearchTerm.toLowerCase()))
                .map(f=>(
                  <li key={f.film_id}>
                    <span>{f.title}</span>
                    <button
                      className="btn-delete"
                      onClick={()=>{
                        setFilmIdToDelete(f.film_id);
                        setShowConfirm(true);
                      }}
                    >Delete</button>
                  </li>
                ))}
            </ul>
            <ConfirmationDialog
              isOpen={showConfirm}
              message="Are you sure you want to delete this film?"
              confirmText="Yes, delete"
              cancelText="No, keep it"
              onConfirm={doDelete}
              onCancel={()=>{
                setShowConfirm(false);
                setFilmIdToDelete(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFilms;

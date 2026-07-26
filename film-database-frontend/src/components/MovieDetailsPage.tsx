import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/MovieDetailsPage.css';
import LoginModal from './LoginModal';
import { fetchMovieDetails as apiFetchMovieDetails } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import Loader from './Loader';
import movie_poster from '../assets/movie_poster.jpg';

interface Actor {
  actorName: string;
  characterName?: string;
  comment?: string;
}

interface Screening {
  screening_id: number;
  screening_date: string;
  organizers: string;
  comment: string | null;
  source: string;
  film_rights: string | null;
  format: string | null;
  audience: string | null;
  screeningCity: string;
  screeningCountry: string;
}

interface InstitutionalInfo {
  institutional_city: string;
  institutional_country: string;
  productionCompany: string;
  fundingCompany: string;
  fundingComment: string;
  source: string;
}

interface ProductionDetails {
  postProductionStudio: string;
  productionComments: string;
  productionTimeframe: string;
  shootingCity: string;
  shootingCountry: string;
}

interface MovieDetails {
  id: string;
  title: string;
  year: number;
  posterUrl: string;
  synopsis: string;
  production: {
    director: string;
    producer: string;
    cast: Actor[];
    runtime: string;
  };
  productionDetails: ProductionDetails;
  authors: { role: string; name: string; comment?: string }[];
  productionTeam: { department: string; name: string; role?: string; comment?: string }[];
  equipment: { equipment_name: string; description?: string; comment?: string }[];
  institutionalInfo: InstitutionalInfo;
  documents: { document_type: string; file_url: string; comment?: string }[];
  gallery: any[];
  av_annotate_link: string;
  screenings: Screening[];
}

interface MovieDetailsPageProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

type Tab = 
  | 'synopsis' 
  | 'filmProduction' 
  | 'institution' 
  | 'screening' 
  | 'gallery' 
  | 'avLink'
  | 'documents';

const tabLabels: Record<Tab, string> = {
  synopsis: 'Synopsis',
  filmProduction: 'Film Production',
  institution: 'Institutional & Financial',
  screening: 'Film Screenings',
  gallery: 'Gallery',
  avLink: 'AV Annotate Link',
  documents: 'Documents',
};

const targetEmail = process.env.REACT_APP_EAC_LAB_EMAIL;

const ContributePopup: React.FC<any> = ({ movieTitle, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [sections, setSections] = useState<Record<Tab, boolean>>({
    synopsis: false,
    filmProduction: false,
    institution: false,
    screening: false,
    gallery: false,
    avLink: false,
    documents: false,
  });
  const [details, setDetails] = useState<Record<Tab, string>>({
    synopsis: '',
    filmProduction: '',
    institution: '',
    screening: '',
    gallery: '',
    avLink: '',
    documents: '',
  });

  const toggleSection = (tab: Tab) => {
    setSections((s) => ({ ...s, [tab]: !s[tab] }));
  };

  const handleSubmit = () => {
    const chosen = (Object.keys(sections) as Tab[])
      .filter((t) => sections[t])
      .map((t) => `${tabLabels[t]}:\n${details[t] || '(no details provided)'}\n`)
      .join('\n') || '(no sections selected)';

    const body = `
Movie: ${movieTitle}

${chosen}

Contributor Info:
Name: ${name}
Email: ${email}
Designation: ${designation}
    `;
    const mailto =
      `mailto:${targetEmail}` +
      `?subject=${encodeURIComponent(`Contribution for ${movieTitle}`)}` +
      `&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    onClose();
  };

  return (
    <div className="contribute-overlay">
      <div className="contribute-dialog wide">
        <h2>Contribute Information</h2>
        <div className="contribute-form">
          <label>
            Your Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Designation
            <input value={designation} onChange={(e) => setDesignation(e.target.value)} />
          </label>

          <fieldset>
            <legend>Which sections would you like to contribute to?</legend>
            {(Object.keys(tabLabels) as Tab[]).map((tab) => (
              <label key={tab} className="section-checkbox">
                <input
                  type="checkbox"
                  checked={sections[tab]}
                  onChange={() => toggleSection(tab)}
                />
                {tabLabels[tab]}
              </label>
            ))}
          </fieldset>

          {/* One textarea per checked section */}
          { (Object.keys(sections) as Tab[]).map(
            (tab) =>
              sections[tab] && (
                <label key={tab} className="section-detail">
                  <strong>{tabLabels[tab]} details</strong>
                  <textarea
                    value={details[tab]}
                    onChange={(e) =>
                      setDetails((d) => ({ ...d, [tab]: e.target.value }))
                    }
                  />
                </label>
              )
          )}

          <div className="contribute-buttons">
            <button className="btn-submit" onClick={handleSubmit}>
              Submit
            </button>
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'synopsis'|'filmProduction'|'institution'|'screening'|'gallery'|'avLink'|'documents'>('synopsis');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showContribute, setShowContribute] = useState(false);
  const [galleryPage, setGalleryPage] = useState(0);
  const imagesPerPage = 3;
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [activeDoc, setActiveDoc] = useState<number | null>(null)


// Then replace your existing fetchMovieDetails useCallback with:

const fetchMovieDetails = useCallback(async () => {
  if (!id) return;

  setIsLoading(true);
  try {
    // call our client helper (throws on 401)
    const {
      film,
      actors,
      productionDetails,
      authors,
      productionTeam,
      equipment,
      institutionalInfo,
      documents,
      screenings,
      gallery,
      poster,
    } = await apiFetchMovieDetails(
      id,
      localStorage.getItem('accessToken') || undefined
    );
    const fetchedMovie: MovieDetails = {
      id: film.film_id.toString(),
      title: film.title,
      year: film.release_year,
      posterUrl:poster?.url || '',
      synopsis: film.synopsis,
      production: {
        director: film.director || 'Unknown',
        producer: film.producer || 'Unknown',
        cast: actors.map((a: any) => ({
          actorName: a.actor_name,
          characterName: a.character_name,
          comment: a.comment,
        })),
        runtime: film.runtime || '-',
      },
      productionDetails: {
        postProductionStudio: productionDetails?.post_production_studio || '-',
        productionComments: productionDetails?.production_comments || '-',
        productionTimeframe: productionDetails?.production_timeframe || '-',
        shootingCity: productionDetails?.shooting_city || '-',
        shootingCountry: productionDetails?.shooting_country || '-',
      },
      authors,
      productionTeam,
      equipment,
      institutionalInfo: {
        productionCompany: institutionalInfo?.production_company || '-',
        fundingCompany: institutionalInfo?.funding_company || '-',
        fundingComment: institutionalInfo?.funding_comment || '-',
        source: institutionalInfo?.source || '-',
        institutional_city: institutionalInfo?.institutional_city || '-',
        institutional_country: institutionalInfo?.institutional_country || '-',
      },
      documents,
      gallery: gallery || [],
      av_annotate_link: film.av_annotate_link || 'No Links Available',
      screenings: screenings.map((s: any) => ({
        screening_id: s.screening_id,
        screening_date: s.screening_date,
        organizers: s.organizers,
        comment: s.comment,
        source: s.source,
        film_rights: s.film_rights,
        format: s.format,
        audience: s.audience,
        screeningCity: s.screening_city || '-',
        screeningCountry: s.screening_country || '-',
      })),
    };

    setMovie(fetchedMovie);
  } catch (error: any) {
    if (error.name === 'Unauthorized') {
      // preserve your 401 logic
      setShowLoginModal(true);
      setMovie(null);
      return;
    }
    console.error('Error fetching film details:', error);
  }
  finally {
    setIsLoading(false);
  }
}, [id]);


  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    fetchMovieDetails();
  }, [id, isLoggedIn, fetchMovieDetails]);

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
    fetchMovieDetails();
  };
  const handleSuccessfulLogin = () => {
    setShowLoginModal(false);
    setIsLoggedIn(true);
    fetchMovieDetails();
  };

  if (!id) {
    return <div>Error: No movie ID provided</div>;
  }
  if (showLoginModal || !isLoggedIn) {
    return <LoginModal onLoginSuccess={handleSuccessfulLogin} onReturnHome={handleLoginModalClose} />;
  }
  if (!movie && isLoading) {
    return <Loader />;
  }
  if (!movie) {
    return <div>Loading...</div>;
  }

  const renderTabContent = () => {

    switch (activeTab) {
      case 'synopsis':
        return <div className="tab-content"><p>{movie.synopsis}</p></div>;

        case 'filmProduction':
  // Group production team by department → role → members[]
  const teamByDept = movie.productionTeam.reduce(
    (acc, m) => {
      const dept = m.department || 'Other';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(m);
      return acc;
    },
    {} as Record<string, typeof movie.productionTeam>
  );

  return (
    <div className="tab-content">
      <h2>Film Production</h2>

      {/* AUTHORS */}
      <section className="grouped-dl-section">
        <h3>Authors</h3>
        {movie.authors.length ? (
          <dl className="two-col-dl">
            {movie.authors.map((a, i) => (
              <React.Fragment key={i}>
                <dt>{a.role}</dt>
                <dd>
                  {a.name}
                  {a.comment && <span className="dl-comment"> — {a.comment}</span>}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        ) : (
          <p>No author information.</p>
        )}
      </section>

      {/* PRODUCTION TEAM */}
      <section className="grouped-dl-section">
        <h3>Production Team</h3>
        {Object.entries(teamByDept).map(([dept, members]) => (
          <div key={dept}>
            <h4>{dept}</h4>
            <dl className="two-col-dl">
              {members.map((m, idx) => (
                <React.Fragment key={idx}>
                  <dt>{m.role || '-'}</dt>
                  <dd>
                    {m.name}
                    {m.comment && <span className="dl-comment"> — {m.comment}</span>}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        ))}
        {!movie.productionTeam.length && <p>No production team data.</p>}
      </section>

      {/* ACTORS */}
      <section className="grouped-dl-section">
        <h3>Actors</h3>
        {movie.production.cast.length ? (
          <dl className="two-col-dl">
            {movie.production.cast.map((c, i) => (
              <React.Fragment key={i}>
                <dt>{c.actorName}</dt>
                <dd>
                  {c.characterName && <><strong>as</strong> {c.characterName}</>}
                  {c.comment && <span className="dl-comment"> — {c.comment}</span>}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        ) : (
          <p>No actors listed.</p>
        )}
      </section>

      {/* EQUIPMENT */}
      <section className="grouped-dl-section">
        <h3>Equipment</h3>
        {movie.equipment.length ? (
          <dl className="two-col-dl">
            {movie.equipment.map((e, i) => (
              <React.Fragment key={i}>
                <dt>{e.equipment_name}</dt>
                <dd>
                  {e.description && <span>{e.description}</span>}
                  {e.comment && <span className="dl-comment"> — {e.comment}</span>}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        ) : (
          <p>No equipment data.</p>
        )}
      </section>

      {/* PRODUCTION DATE & PLACE */}
      <section className="grouped-dl-section">
        <h3>Production Date & Place</h3>
        <dl className="two-col-dl">
          <dt>Time Frame</dt>
          <dd>{movie.productionDetails.productionTimeframe || '-'}</dd>
          <dt>City</dt>
          <dd>{movie.productionDetails.shootingCity || '-'}</dd>
          <dt>Country</dt>
          <dd>{movie.productionDetails.shootingCountry || '-'}</dd>
          <dt>Post‑Production Studio</dt>
          <dd>{movie.productionDetails.postProductionStudio || '-'}</dd>
          <dt>Comments</dt>
          <dd>{movie.productionDetails.productionComments || '-'}</dd>
        </dl>
      </section>
    </div>
  );

  case 'institution':
    return (
      <div className="tab-content">
        <h2>Institutional & Financial Info</h2>
        <section className="grouped-dl-section">
          <dl className="two-col-dl">
            <dt>Production Company</dt>
            <dd>{movie.institutionalInfo.productionCompany || '-'}</dd>
  
            <dt>Funding Company</dt>
            <dd>{movie.institutionalInfo.fundingCompany || '-'}</dd>
  
            <dt>Funding Comment</dt>
            <dd>{movie.institutionalInfo.fundingComment || '-'}</dd>
  
            <dt>City</dt>
            <dd>{movie.institutionalInfo.institutional_city || '-'}</dd>
  
            <dt>Country</dt>
            <dd>{movie.institutionalInfo.institutional_country || '-'}</dd>
  
            <dt>Source</dt>
            <dd>
              {movie.institutionalInfo.source?.startsWith('http') ? (
                <a
                  href={movie.institutionalInfo.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Link
                </a>
              ) : (
                movie.institutionalInfo.source || '-'
              )}
            </dd>
          </dl>
        </section>
      </div>
    );
  

        case 'screening':
          return (
            <div className="tab-content">
              <h2>Film Screenings</h2>
              {movie.screenings.length > 0 ? (
                <div className="table-responsive">
                  <table className="screenings-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>City</th>
                        <th>Country</th>
                        <th>Organizers</th>
                        <th>Source</th>
                        <th>Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movie.screenings.map((s) => (
                        <tr key={s.screening_id}>
                          <td>{new Date(s.screening_date).toLocaleDateString()}</td>
                          <td>{s.screeningCity}</td>
                          <td>{s.screeningCountry}</td>
                          <td>{s.organizers}</td>
                          <td>
                            {s.source.startsWith('http') ? (
                              <a href={s.source} target="_blank" rel="noopener noreferrer">
                                Link
                              </a>
                            ) : (
                              s.source
                            )}
                          </td>
                          <td>{s.comment || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No screening details available.</p>
              )}
            </div>
          );
        

           // inside MovieDetailsPage.tsx (or wherever you render tabs)
          case 'gallery': {
            const totalPages = Math.ceil(movie.gallery.length / imagesPerPage);

            return (
              <div className="tab-content gallery">
                {movie.gallery.length > 0 ? (
                  <>
                    <div className="gallery-grid">
                      {movie.gallery
                        .slice(galleryPage * imagesPerPage, (galleryPage + 1) * imagesPerPage)
                        .map((img) => (
                          <div key={img.imageId} className="gallery-item">
                            <img
                              src={img.url}
                              alt={img.filename}
                              className="gallery-image"
                            />
                            <div className="gallery-caption">{img.filename}</div>
                          </div>
                        ))}
                    </div>

                    <div className="gallery-nav">
                      {galleryPage > 0 && (
                        <button
                          className="gallery-arrow left"
                          onClick={() => setGalleryPage((p) => p - 1)}
                        >
                          ‹
                        </button>
                      )}
                      {galleryPage + 1 < totalPages && (
                        <button
                          className="gallery-arrow right"
                          onClick={() => setGalleryPage((p) => p + 1)}
                        >
                          ›
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="no-gallery">No gallery images available.</p>
                )}
              </div>
            );
          }
          case 'documents': {
            return (
              <div className="tab-content documents-tab">
                {movie.documents.length > 0 ? (
                  movie.documents.map((doc: any) => (
                    <div key={doc.documentId} className="doc-card">
                      <div className="doc-card-header">
                        <span className="doc-icon">
                          {doc.contentType === 'application/pdf' ? '📄' : '📁'}
                        </span>
                        <span className="doc-filename">{doc.filename}</span>
                        <div className="doc-actions">
                          <button
                            className="btn-view"
                            onClick={() =>
                              setActiveDoc(activeDoc === doc.documentId ? null : doc.documentId)
                            }
                          >
                            {activeDoc === doc.documentId ? 'Hide' : 'View'}
                          </button>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-download"
                          >
                            Download ↗
                          </a>
                        </div>
                      </div>

                      {activeDoc === doc.documentId && (
                        <div className="doc-iframe-wrapper">
                          <iframe
                            src={doc.url}
                            title={doc.filename}
                            className="doc-iframe"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-document">No documents available.</p>
                )}
              </div>
            )
          }


      case 'avLink':
        return (
          <div className="tab-content">
            {movie.av_annotate_link ? (
              <a href={movie.av_annotate_link} target="_blank" rel="noopener noreferrer">
                {movie.av_annotate_link}
              </a>
            ) : <p>No AV Annotate link available.</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="movie-details-page">
      <div className="hero-section">
                  <img
              src={movie.posterUrl || movie_poster}
              alt={movie.title}
              className="hero-poster"
              // onError={(e) => {
              //   e.currentTarget.src = movie_poster; // fallback image
              // }}
            />

        <div className="hero-info">
          <h1 className="hero-title">{movie.title}</h1>
          <p className="hero-year">{movie.year}</p>
          <button
            className="contribute-button"
            title="Have more info? Click to contribute!"
            onClick={() => setShowContribute(true)}
          >
            Contribute
          </button>
        </div>
      </div>

      <div className="tabs">
        {(Object.keys(tabLabels) as Tab[]).map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : '-'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="tab-panel">{renderTabContent()}</div>
      {showContribute && (
        <ContributePopup
          movieTitle={movie.title}
          onClose={() => setShowContribute(false)}
        />
      )}
    </div>
  );
};

export default MovieDetailsPage;

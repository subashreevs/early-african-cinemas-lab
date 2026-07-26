import React from 'react';
import '../styles/AddAttachments.css';
import { PosterForm } from './PosterForm';
import { GalleryForm } from './GalleryForm';
import { DocumentsForm } from './DocumentForm';

interface AddAttachmentsProps {
  filmId: string;
  onBack: any;
}

const AddAttachments: React.FC<AddAttachmentsProps> = ({ filmId, onBack }) => (
  <div className="attachments-container">
    <h3 className="attachments-title">Manage Attachments</h3>
    <button className="btn-back" onClick={onBack}>
      ← Back to Details
    </button>
    <div className="info-note">
      ℹ️ Currently max upload size is <strong>8 KB</strong>. We’re working on increasing this limit.  
    </div>
    <section className="attachment-section poster-section">
      <PosterForm filmId={filmId} />
    </section>

    <section className="attachment-section gallery-section">
      <GalleryForm filmId={filmId} />
    </section>

    <section className="attachment-section documents-section">
      <DocumentsForm filmId={filmId} />
    </section>
  </div>
);

export default AddAttachments;

import React from 'react';
import '../styles/AddAttachments.css';
import { PosterForm } from './PosterForm';

interface AddAttachmentsProps {
  filmId: string;
  onBack: any;
}

const AddAttachments: React.FC<AddAttachmentsProps> = ({ filmId, onBack }) => (
  <div className="attachments-container">
    <h3 className="attachments-title">Manage Poster</h3>
    <button className="btn-back" onClick={onBack}>
      Back to film list
    </button>
    <section className="attachment-section poster-section">
      <PosterForm filmId={filmId} />
    </section>

  </div>
);

export default AddAttachments;

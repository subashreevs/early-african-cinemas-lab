import React from 'react';
import './Loader.css';

const Loader: React.FC = () => {
  return (
    <div className="loader-overlay" role="status" aria-label="Loading">
      <div className="spinner" aria-hidden="true"></div>
    </div>
  );
};

export default Loader;

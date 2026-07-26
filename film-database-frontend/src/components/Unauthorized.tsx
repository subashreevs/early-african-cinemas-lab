import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Unauthorized.css';

const Unauthorized: React.FC = () => {
  return (
    <div className="unauthorized-container">
      <h1>Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
      <Link to="/">Return Home</Link>
    </div>
  );
};

export default Unauthorized;

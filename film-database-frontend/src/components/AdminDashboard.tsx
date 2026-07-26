// AdminDashboard.tsx
import React, { useState } from 'react';
import AdminFilms from './AdminFilms';
import AdminUsers from './AdminUsers';
import '../styles/AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  // Two main tabs: one for films, one for users
  const [activeTab, setActiveTab] = useState<'films' | 'users'>('films');
  const descriptions = {
   films: 'This interface enables administrators to create, edit, and remove film records with precision and ease.',
   users: 'This interface allows administrators to manage user accounts. Note: Standard users may only view film details and submit contributions; only administrators may modify or delete user profiles.',
     };
    
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-tabs">
        <button 
          className={activeTab === 'films' ? 'active' : ''} 
          onClick={() => setActiveTab('films')}
        >
          Manage Films
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
      </div>
      <div className="admin-description">
         {descriptions[activeTab]}
      </div>
      <div className="admin-content">
        {activeTab === 'films' && <AdminFilms />}
        {activeTab === 'users' && <AdminUsers />}
      </div>
    </div>
  );
};

export default AdminDashboard;

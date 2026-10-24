// AdminDashboard.tsx
import React, { useState } from 'react';
import { Film, Users } from 'lucide-react';
import AdminFilms from './AdminFilms';
import AdminUsers from './AdminUsers';
import '../styles/AdminDashboard.css';

interface AdminDashboardProps {
  userRole: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'films' | 'users'>('films');
  const isAdmin = userRole === 'admin';
  const descriptions = {
    films: isAdmin
      ? 'Add new records, update film information, and manage the film database.'
      : 'Add new records and update existing film information.',
    users: 'Create accounts, reset credentials, and control access.',
  };
  const contentHeader = (
    <div className="admin-content-header">
      <div>
        <h2>{activeTab === 'films' ? 'Film Records' : 'User Access'}</h2>
      </div>
      <span>{descriptions[activeTab]}</span>
    </div>
  );

  if (!isAdmin) {
    return (
      <main className="admin-dashboard">
        <header className="admin-header">
          <h1>Research Workspace</h1>
          <span>Add new records and update existing film information.</span>
        </header>

        <section className="admin-workspace-content editor-workspace-content">
          {contentHeader}
          <AdminFilms canDelete={false} />
        </section>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <h1>Research Workspace</h1>
        <span>Choose an area, then select the task you want to complete.</span>
      </header>

      <div className="admin-workspace">
        <nav className="admin-section-nav" aria-label="Administration areas">
          <button
            className={activeTab === 'films' ? 'active' : ''}
            onClick={() => setActiveTab('films')}
          >
            <Film size={20} aria-hidden="true" />
            <span><strong>Films</strong><small>Database records</small></span>
          </button>
          {isAdmin && (
            <button
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <Users size={20} aria-hidden="true" />
              <span><strong>User Access</strong><small>Accounts and permissions</small></span>
            </button>
          )}
        </nav>

        <section className="admin-workspace-content">
          {contentHeader}
          {activeTab === 'films' && <AdminFilms canDelete={isAdmin} />}
          {isAdmin && activeTab === 'users' && <AdminUsers />}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;

// src/components/AdminUsers.tsx

import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import NotificationPopup from './NotificationPopup';
import ConfirmationDialog from './ConfirmationDialog';
import { apiFetch } from '../apifetch';
import { ENDPOINTS } from '../api/endpoints';
import '../styles/AdminUsers.css';
import Loader from './Loader';

interface User {
  user_id?: number;
  username: string;
  role: string;
}

interface AddUserForm {
  username: string;
  password: string;
}

interface UpdateUserForm {
  username: string;
  newPassword: string;
  confirmNewPassword: string;
}

const addUserSchema = Yup.object().shape({
  username: Yup.string().required('Username required'),
  password: Yup.string().required('Password required'),
});

const updateUserSchema = Yup.object().shape({
  username: Yup.string().required('Username required'),
  newPassword: Yup.string().required('New password required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm your new password'),
});

const initialAddValues: AddUserForm = {
  username: '',
  password: '',
};

const AdminUsers: React.FC = () => {
  const [activeUserTab, setActiveUserTab] = useState<'add' | 'update' | 'delete'>('add');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // delete/search state
  const [deleteSearchTerm, setDeleteSearchTerm] = useState('');
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // update/search state
  const [updateSearchTerm, setUpdateSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(ENDPOINTS.USERS, {
        headers: {
          Authorization: localStorage.getItem('accessToken')
            ? `Bearer ${localStorage.getItem('accessToken')}`
            : '',
        },
      });
      if (!res.ok) {
        setMessage('Failed to load users list.');
        return;
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      setMessage('Error loading users: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    setSelectedUser(null);
    setMessage('');
    setDeleteSearchTerm('');
    setUserIdToDelete(null);
    setShowDeleteConfirm(false);
    setUpdateSearchTerm('');
  }, [activeUserTab]);

  // --- Add user ---
  const onAddUserSubmit = async (vals: AddUserForm, actions: any) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(ENDPOINTS.USERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ ...vals, role: 'reader' }),
      });
      if (!res.ok) {
        const err = await res.json();
        actions.setErrors({ username: err.error || 'Submission error' });
        setMessage(err.error || 'Submission error');
        return;
      }
      setMessage('User added successfully!');
      actions.resetForm();
      loadUsers();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      actions.setSubmitting(false);
      setIsLoading(false);
    }
  };

  // --- Update user ---
  const onUpdateUserSubmit = async (vals: UpdateUserForm, actions: any) => {
    if (!selectedUser?.user_id) {
      setMessage('No user selected');
      actions.setSubmitting(false);
      return;
    }
    setIsLoading(true);
    try {
      const payload = { username: vals.username, password: vals.newPassword };
      const res = await apiFetch(ENDPOINTS.USER(selectedUser.user_id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        actions.setErrors({ username: err.error || 'Submission error' });
        setMessage(err.error || 'Submission error');
        return;
      }
      setMessage('User updated successfully!');
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      actions.setSubmitting(false);
      setIsLoading(false);
    }
  };

  // --- Delete user ---
  const onDeleteUser = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(ENDPOINTS.USER(id), {
        method: 'DELETE',
        headers: {
          Authorization: localStorage.getItem('accessToken')
            ? `Bearer ${localStorage.getItem('accessToken')}`
            : '',
        },
      });
      if (!res.ok) {
        setMessage('Failed to delete user');
        return;
      }
      setMessage('User deleted successfully!');
      loadUsers();
    } catch (err: any) {
      setMessage('Error deleting user: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setUserIdToDelete(id);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = () => {
    if (userIdToDelete !== null) onDeleteUser(userIdToDelete);
    setShowDeleteConfirm(false);
    setUserIdToDelete(null);
  };

  return (
    <div className="admin-dashboard">
      {isLoading && <Loader />}
      <div className="admin-tabs">
        <button
          className={activeUserTab === 'add' ? 'active' : ''}
          onClick={() => setActiveUserTab('add')}
        >
          Add User
        </button>
        <button
          className={activeUserTab === 'update' ? 'active' : ''}
          onClick={() => setActiveUserTab('update')}
        >
          Update User
        </button>
        <button
          className={activeUserTab === 'delete' ? 'active' : ''}
          onClick={() => setActiveUserTab('delete')}
        >
          Delete User
        </button>
      </div>

      {message && <NotificationPopup message={message} onClose={() => setMessage('')} />}

      <div className="admin-content">
        {/* ADD */}
        {activeUserTab === 'add' && (
          <Formik
            initialValues={initialAddValues}
            validationSchema={addUserSchema}
            onSubmit={onAddUserSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="admin-form">
                <div>
                  <label>Username:</label>
                  <Field name="username" />
                  {errors.username && touched.username && (
                    <div className="error">{errors.username}</div>
                  )}
                </div>
                <div>
                  <label>Password:</label>
                  <Field name="password" type="password" />
                  {errors.password && touched.password && (
                    <div className="error">{errors.password}</div>
                  )}
                </div>
                <button className="btn-edit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add User'}
                </button>
              </Form>
            )}
          </Formik>
        )}

        {/* UPDATE */}
        {activeUserTab === 'update' && (
          <>
            {!selectedUser ? (
              <>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={updateSearchTerm}
                  onChange={(e) => setUpdateSearchTerm(e.target.value)}
                  className="search-bar"
                />
                <ul className="users-list">
                  {users
                    .filter((u) =>
                      u.username.toLowerCase().includes(updateSearchTerm.toLowerCase())
                    )
                    .map((u) => (
                      <li key={u.user_id}>
                        <span>{u.username}</span>
                        <button className="btn-edit" onClick={() => setSelectedUser(u)}>
                          Edit
                        </button>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <Formik
                initialValues={{
                  username: selectedUser.username,
                  newPassword: '',
                  confirmNewPassword: '',
                }}
                validationSchema={updateUserSchema}
                onSubmit={onUpdateUserSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="admin-form">
                    <div>
                      <label>Username:</label>
                      <Field name="username" />
                      {errors.username && touched.username && (
                        <div className="error">{errors.username}</div>
                      )}
                    </div>
                    <div>
                      <label>New Password:</label>
                      <Field name="newPassword" type="password" />
                      {errors.newPassword && touched.newPassword && (
                        <div className="error">{errors.newPassword}</div>
                      )}
                    </div>
                    <div>
                      <label>Confirm New Password:</label>
                      <Field name="confirmNewPassword" type="password" />
                      {errors.confirmNewPassword && touched.confirmNewPassword && (
                        <div className="error">{errors.confirmNewPassword}</div>
                      )}
                    </div>
                    <button className="btn-update" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update User'}
                    </button>
                    <button
                      className="btn-cancel"
                      type="button"
                      onClick={() => setSelectedUser(null)}
                    >
                      Cancel
                    </button>
                  </Form>
                )}
              </Formik>
            )}
          </>
        )}

        {/* DELETE */}
        {activeUserTab === 'delete' && (
          <>
            <input
              type="text"
              placeholder="Search users..."
              value={deleteSearchTerm}
              onChange={(e) => setDeleteSearchTerm(e.target.value)}
              className="search-bar"
            />
            <ul className="users-list">
              {users
                .filter((u) =>
                  u.username.toLowerCase().includes(deleteSearchTerm.toLowerCase())
                )
                .map((u) => (
                  <li key={u.user_id}>
                    <span>{u.username}</span>
                    <button className="btn-delete" onClick={() => handleDeleteClick(u.user_id!)}>
                      Delete
                    </button>
                  </li>
                ))}
            </ul>
          </>
        )}

        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          message="Are you sure you want to delete this user?"
          confirmText="Yes, delete"
          cancelText="No, keep"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

export default AdminUsers;

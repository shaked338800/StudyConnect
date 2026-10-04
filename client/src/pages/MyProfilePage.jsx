import { useEffect, useState } from 'react';
import FormField from '../components/FormField';
import { getMyProfile, updateMyProfile, deleteMyAccount } from '../api/usersApi';
import { validateProfileForm, isValid } from '../utils/validation';
import { notify } from '../jquery/notify';

// Converts a user object from the server into form values (never undefined)
function toForm(user) {
  return {
    email: user.email || '',
    fullName: user.fullName || '',
    institution: user.institution || '',
    fieldOfStudy: user.fieldOfStudy || '',
    bio: user.bio || ''
  };
}

// [REQ-19 User - Update + Delete] [REQ-21 only my own private data]
function MyProfilePage({ onUserUpdated, onAccountDeleted }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyProfile();
        setProfile(data.user);
      } catch {
        // toast shown by global ajaxError
      }
    }
    loadProfile();
  }, []);

  function startEditing() {
    setForm(toForm(profile));
    setErrors({});
    setEditing(true);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();

    const newErrors = validateProfileForm(form);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    setSaving(true);
    try {
      const data = await updateMyProfile({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        institution: form.institution.trim(),
        fieldOfStudy: form.fieldOfStudy.trim(),
        bio: form.bio.trim()
      });
      setProfile(data.user);
      onUserUpdated(data.user);
      setEditing(false);
      notify('Profile updated', 'success');
    } catch {
      // e.g. "This email is already in use" - global ajaxError toast
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e) {
    e.preventDefault();
    if (deletePassword === '') {
      setDeleteError('Please enter your password');
      return;
    }
    setDeleteError('');
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;

    try {
      await deleteMyAccount(deletePassword);
      notify('Your account was deleted', 'info');
      onAccountDeleted();
    } catch {
      // e.g. "Wrong password" - global ajaxError toast
    }
  }

  if (!profile) {
    return <section className="card"><p className="muted">Loading profile...</p></section>;
  }

  return (
    <>
      <section className="card">
        <h2>My Profile</h2>

        {!editing && (
          <div className="profile">
            <div className="avatar avatar-large">{profile.fullName.charAt(0).toUpperCase()}</div>
            <h3>{profile.fullName}</h3>
            <p className="muted">@{profile.username}</p>
            <p><strong>Email (private):</strong> {profile.email}</p>
            <p><strong>Institution:</strong> {profile.institution || '-'}</p>
            <p><strong>Field of study:</strong> {profile.fieldOfStudy || '-'}</p>
            <p><strong>Bio:</strong> {profile.bio || '-'}</p>
            <button className="btn" onClick={startEditing}>Edit profile</button>
          </div>
        )}

        {editing && (
          <form onSubmit={handleSave} noValidate>
            <FormField label="Email *" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} maxLength={100} />
            <FormField label="Full name *" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} maxLength={60} />
            <FormField label="Institution" name="institution" value={form.institution} onChange={handleChange} error={errors.institution} maxLength={80} />
            <FormField label="Field of study" name="fieldOfStudy" value={form.fieldOfStudy} onChange={handleChange} error={errors.fieldOfStudy} maxLength={80} />
            <FormField label="Bio" name="bio" multiline value={form.bio} onChange={handleChange} error={errors.bio} maxLength={300} />
            <div className="button-row">
              <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </section>

      <section className="card danger-zone">
        <h3>Delete account</h3>
        <p className="muted">Enter your password to permanently delete your account.</p>
        <form className="search-bar" onSubmit={handleDelete} noValidate>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Your password"
            maxLength={72}
          />
          <button className="btn btn-danger" type="submit">Delete my account</button>
        </form>
        {deleteError && <p className="field-error">{deleteError}</p>}
      </section>
    </>
  );
}

export default MyProfilePage;

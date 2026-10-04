import { useEffect, useState } from 'react';
import { getUser } from '../api/usersApi';

// Public profile of another user (read-only, no email).
function UserProfilePage({ userId, onNavigate }) {
  const [user, setUser] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getUser(userId);
        setUser(data.user);
      } catch {
        setNotFound(true); // toast shown by global ajaxError
      }
    }
    loadUser();
  }, [userId]);

  return (
    <section className="card">
      <button className="link-button" onClick={() => onNavigate('people')}>&larr; Back to People</button>

      {notFound && <p className="muted">This user could not be loaded.</p>}

      {user && (
        <div className="profile">
          <div className="avatar avatar-large">{user.fullName.charAt(0).toUpperCase()}</div>
          <h2>{user.fullName}</h2>
          <p className="muted">@{user.username}</p>
          <p><strong>Institution:</strong> {user.institution || '-'}</p>
          <p><strong>Field of study:</strong> {user.fieldOfStudy || '-'}</p>
          <p><strong>Bio:</strong> {user.bio || '-'}</p>
          <p className="muted">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </section>
  );
}

export default UserProfilePage;

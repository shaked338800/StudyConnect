import { useEffect, useState } from 'react';
import { getUsers } from '../api/usersApi';

// [REQ-19 User - List + Search]
function PeoplePage({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchError, setSearchError] = useState('');
  const [loaded, setLoaded] = useState(false);

  async function loadUsers(q) {
    try {
      const data = await getUsers(q);
      setUsers(data.users);
      setLoaded(true);
    } catch {
      // error toast is shown by the global ajaxError handler
    }
  }

  // Load the full list when the page opens
  useEffect(() => {
    loadUsers('');
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchText.trim().length > 50) {
      setSearchError('Search text must be at most 50 characters');
      return;
    }
    setSearchError('');
    loadUsers(searchText.trim());
  }

  function handleClear() {
    setSearchText('');
    setSearchError('');
    loadUsers('');
  }

  return (
    <section className="card">
      <h2>People</h2>

      <form className="search-bar" onSubmit={handleSearch} noValidate>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by name, username, institution or field of study"
          maxLength={50}
        />
        <button className="btn" type="submit">Search</button>
        <button className="btn btn-secondary" type="button" onClick={handleClear}>Clear</button>
      </form>
      {searchError && <p className="field-error">{searchError}</p>}

      {loaded && users.length === 0 && <p className="muted">No users found.</p>}

      <ul className="user-list">
        {users.map((u) => (
          <li key={u._id} className="user-item" onClick={() => onNavigate('user', { userId: u._id })}>
            <div className="avatar">{u.fullName.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{u.fullName}</strong> <span className="muted">@{u.username}</span>
              <div className="muted">
                {[u.institution, u.fieldOfStudy].filter(Boolean).join(' · ') || 'No details yet'}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default PeoplePage;

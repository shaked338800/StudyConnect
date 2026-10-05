import { useEffect, useState } from 'react';
import { getHealth } from '../api/healthApi';
import { notify } from '../jquery/notify';

// Home page: welcome message + system status
// (React -> jQuery AJAX -> Express -> MongoDB).
function HomePage({ user }) {
  const [health, setHealth] = useState(null);
  const [failed, setFailed] = useState(false);

  async function checkHealth(showToast) {
    try {
      const data = await getHealth(); // jQuery's jqXHR can be awaited
      setHealth(data);
      setFailed(false);
      if (showToast) notify('Server is up. Database: ' + data.database, 'success');
    } catch {
      // The global ajaxError handler already showed an error toast
      setHealth(null);
      setFailed(true);
    }
  }

  useEffect(() => {
    checkHealth(false);
  }, []);

  return (
    <>
      <section className="card">
        <h2>Welcome, {user.fullName}!</h2>
        <p className="muted">Share study notes under Posts, or find and create a study group under Groups. Chat is coming in a later phase.</p>
      </section>

      <section className="card">
        <h2>System status</h2>

        {failed && <p className="status status-bad">Server: not reachable</p>}

        {health && (
          <>
            <p className="status status-good">Server: {health.server}</p>
            <p className={'status ' + (health.database === 'connected' ? 'status-good' : 'status-bad')}>
              Database: {health.database}
            </p>
            <p className="muted">Checked at {new Date(health.time).toLocaleTimeString()}</p>
          </>
        )}

        <button className="btn" onClick={() => checkHealth(true)}>Check again</button>
      </section>
    </>
  );
}

export default HomePage;

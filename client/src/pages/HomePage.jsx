import { useEffect, useState } from 'react';
import { getHealth } from '../api/healthApi';
import { notify } from '../jquery/notify';

// Phase 1 page: proves React -> jQuery AJAX -> Express -> MongoDB works.
function HomePage() {
  const [health, setHealth] = useState(null);
  const [failed, setFailed] = useState(false);

  async function checkHealth() {
    try {
      const data = await getHealth(); // jQuery's jqXHR can be awaited
      setHealth(data);
      setFailed(false);
      notify('Server is up. Database: ' + data.database, 'success');
    } catch {
      // The global ajaxError handler already showed an error toast
      setHealth(null);
      setFailed(true);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  return (
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

      <button className="btn" onClick={checkHealth}>Check again</button>
    </section>
  );
}

export default HomePage;

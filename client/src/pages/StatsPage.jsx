import { useEffect, useState } from 'react';
import PostsByCourseChart from '../components/charts/PostsByCourseChart';
import PostsByMonthChart from '../components/charts/PostsByMonthChart';
import { getPostsByCourse, getPostsByMonth } from '../api/statsApi';

// [REQ-29 D3.js] Statistics page: two charts drawn with D3 from live MongoDB data.
// Nothing here is hard-coded - every number comes from the two $.ajax calls.
function StatsPage() {
  const [byCourse, setByCourse] = useState(null); // null = not loaded yet
  const [byMonth, setByMonth] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  async function loadStats() {
    try {
      // Both requests run at the same time; await waits for both
      const [courseResult, monthResult] = await Promise.all([getPostsByCourse(), getPostsByMonth()]);
      setByCourse(courseResult.data);
      setByMonth(monthResult.data);
      setUpdatedAt(new Date());
    } catch {
      // toast shown by the global ajaxError handler
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const totalPosts = byCourse ? byCourse.reduce((sum, row) => sum + row.count, 0) : 0;

  return (
    <>
      <section className="card">
        <div className="card-title-row">
          <h2>Statistics</h2>
          <button className="btn" onClick={loadStats}>Refresh data</button>
        </div>
        <p className="muted">
          Live numbers from the database, drawn with D3.js.
          {updatedAt && <> Total posts: <strong>{totalPosts}</strong> · updated {updatedAt.toLocaleTimeString()}</>}
        </p>
      </section>

      <section className="card">
        <h3>Posts by course</h3>
        <p className="muted small">How many posts were written for each course (top 10, the rest as "Other").</p>
        {byCourse === null ? <p className="muted">Loading...</p> : <PostsByCourseChart data={byCourse} />}
        {byCourse && byCourse.length > 0 && (
          <details className="chart-table">
            <summary>Show data table</summary>
            <table>
              <thead><tr><th>Course</th><th>Posts</th></tr></thead>
              <tbody>
                {byCourse.map((row) => <tr key={row.course}><td>{row.course}</td><td>{row.count}</td></tr>)}
              </tbody>
            </table>
          </details>
        )}
      </section>

      <section className="card">
        <h3>Posts per month</h3>
        <p className="muted small">How many posts were written each month (months without posts show 0).</p>
        {byMonth === null ? <p className="muted">Loading...</p> : <PostsByMonthChart data={byMonth} />}
        {byMonth && byMonth.length > 0 && (
          <details className="chart-table">
            <summary>Show data table</summary>
            <table>
              <thead><tr><th>Month</th><th>Posts</th></tr></thead>
              <tbody>
                {byMonth.map((row) => <tr key={row.label}><td>{row.label}</td><td>{row.count}</td></tr>)}
              </tbody>
            </table>
          </details>
        )}
      </section>
    </>
  );
}

export default StatsPage;

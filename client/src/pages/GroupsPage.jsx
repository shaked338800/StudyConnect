import { useEffect, useState } from 'react';
import GroupCard from '../components/GroupCard';
import GroupForm from '../components/GroupForm';
import GroupSearchForm from '../components/GroupSearchForm';
import { getGroups, searchGroups, createGroup } from '../api/groupsApi';
import { notify } from '../jquery/notify';

// Readable summary of the advanced filters
function describeGroupFilters(f) {
  const parts = [];
  if (f.course) parts.push(`course "${f.course}"`);
  if (f.institution) parts.push(`institution "${f.institution}"`);
  if (f.studyFormat) parts.push(f.studyFormat);
  if (f.openSpots) parts.push('only with open spots');
  return parts.length ? parts.join(', ') : 'no filters (all groups)';
}

// [REQ-19 StudyGroup - Create + List + Search] [REQ-20 advanced search #2]
function GroupsPage({ user, onNavigate }) {
  const [groups, setGroups] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchError, setSearchError] = useState('');
  const [creating, setCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [resultInfo, setResultInfo] = useState(''); // what the list below is showing

  async function loadGroups(q) {
    try {
      const data = await getGroups(q);
      setGroups(data.groups);
      setLoaded(true);
      setResultInfo(q ? `Simple search "${q}"` : '');
    } catch {
      // toast shown by the global ajaxError handler
    }
  }

  useEffect(() => {
    loadGroups('');
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchText.trim().length > 50) {
      setSearchError('Search text must be at most 50 characters');
      return;
    }
    setSearchError('');
    loadGroups(searchText.trim());
  }

  function handleClear() {
    setSearchText('');
    setSearchError('');
    loadGroups('');
  }

  // Called by GroupForm with validated data. If the request fails, the
  // error goes back to GroupForm (which stops its "Saving..." state).
  async function handleCreate(data) {
    const result = await createGroup(data);
    notify('Group "' + result.group.name + '" created', 'success');
    onNavigate('group', { groupId: result.group._id });
  }

  // [REQ-20] Called by GroupSearchForm with validated filters
  async function handleAdvancedSearch(filters) {
    try {
      const data = await searchGroups(filters);
      setGroups(data.groups);
      setLoaded(true);
      setSearchText('');
      setResultInfo('Advanced search: ' + describeGroupFilters(filters));
    } catch {
      // global ajaxError toast
    }
  }

  function openGroup(groupId) {
    onNavigate('group', { groupId });
  }

  return (
    <>
      <section className="card">
        <div className="card-title-row">
          <h2>Study Groups</h2>
          {!creating && <button className="btn" onClick={() => setCreating(true)}>+ New group</button>}
        </div>

        {creating && (
          <div className="inner-form">
            <h3>Create a study group</h3>
            <GroupForm submitLabel="Create group" onSubmit={handleCreate} onCancel={() => setCreating(false)} />
          </div>
        )}

        <form className="search-bar" onSubmit={handleSearch} noValidate>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Quick search: group name, course or institution"
            maxLength={50}
          />
          <button className="btn" type="submit">Search</button>
          <button className="btn btn-secondary" type="button" onClick={handleClear}>Clear</button>
        </form>
        {searchError && <p className="field-error">{searchError}</p>}

        <button className="link-button" onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? 'Hide advanced search' : 'Advanced search (filters)...'}
        </button>
        {showAdvanced && <GroupSearchForm onSearch={handleAdvancedSearch} onReset={() => loadGroups('')} />}
      </section>

      {resultInfo && (
        <p className="result-info">{resultInfo} - {groups.length} result{groups.length === 1 ? '' : 's'}</p>
      )}

      {loaded && groups.length === 0 && (
        <section className="card"><p className="muted">No groups found.</p></section>
      )}

      {/* [REQ-27 multiple-columns] the cards flow into CSS columns (see .groups-grid) */}
      <div className="groups-grid">
        {groups.map((group) => (
          <GroupCard key={group._id} group={group} currentUserId={user._id} onOpen={openGroup} />
        ))}
      </div>
    </>
  );
}

export default GroupsPage;

import { useState } from 'react';
import FormField from './FormField';
import { validateGroupSearchForm, isValid, STUDY_FORMATS } from '../utils/validation';

const EMPTY_FILTERS = { course: '', institution: '', studyFormat: '', openSpots: false };

// [REQ-20] Advanced search #2 - the filter panel for study groups.
// All filters are optional; filled-in filters are combined (AND).
function GroupSearchForm({ onSearch, onReset }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validateGroupSearchForm(filters);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    onSearch({
      course: filters.course.trim(),
      institution: filters.institution.trim(),
      studyFormat: filters.studyFormat,
      openSpots: filters.openSpots
    });
  }

  function handleReset() {
    setFilters(EMPTY_FILTERS);
    setErrors({});
    onReset();
  }

  return (
    <form className="filter-panel" onSubmit={handleSubmit} noValidate>
      <fieldset>
        <legend>Advanced group search - filters (all optional, combined)</legend>
        <div className="filter-grid">
          <FormField label="Course" name="course" value={filters.course} onChange={handleChange} error={errors.course} maxLength={50} />
          <FormField label="Institution" name="institution" value={filters.institution} onChange={handleChange} error={errors.institution} maxLength={50} />
          <FormField label="Study format" name="studyFormat" value={filters.studyFormat} onChange={handleChange}
            error={errors.studyFormat} options={STUDY_FORMATS} emptyLabel="Any format" />
          <div className="form-field checkbox-field">
            <label>
              <input
                type="checkbox"
                checked={filters.openSpots}
                onChange={(e) => setFilters({ ...filters, openSpots: e.target.checked })}
              />
              Only groups with open spots
            </label>
          </div>
        </div>
        <div className="button-row">
          <button className="btn" type="submit">Search</button>
          <button className="btn btn-secondary" type="button" onClick={handleReset}>Reset</button>
        </div>
      </fieldset>
    </form>
  );
}

export default GroupSearchForm;

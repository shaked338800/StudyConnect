import { useState } from 'react';
import FormField from './FormField';
import { validatePostSearchForm, isValid } from '../utils/validation';

const EMPTY_FILTERS = { keyword: '', course: '', author: '', dateFrom: '', dateTo: '' };

// [REQ-20] Advanced search #1 - the filter panel for posts.
// All filters are optional; filled-in filters are combined (AND).
// onSearch(filters) and onReset() are handled by the page.
function PostSearchForm({ onSearch, onReset }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validatePostSearchForm(filters);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    onSearch({
      keyword: filters.keyword.trim(),
      course: filters.course.trim(),
      author: filters.author.trim(),
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
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
        <legend>Advanced post search - filters (all optional, combined)</legend>
        <div className="filter-grid">
          <FormField label="Keyword (title or content)" name="keyword" value={filters.keyword} onChange={handleChange} error={errors.keyword} maxLength={50} />
          <FormField label="Course" name="course" value={filters.course} onChange={handleChange} error={errors.course} maxLength={50} />
          <FormField label="Author username" name="author" value={filters.author} onChange={handleChange} error={errors.author} maxLength={20} placeholder="e.g. dana_k" />
          <div />
          <FormField label="From date" name="dateFrom" type="date" value={filters.dateFrom} onChange={handleChange} error={errors.dateFrom} />
          <FormField label="To date (inclusive)" name="dateTo" type="date" value={filters.dateTo} onChange={handleChange} error={errors.dateTo} />
        </div>
        <div className="button-row">
          <button className="btn" type="submit">Search</button>
          <button className="btn btn-secondary" type="button" onClick={handleReset}>Reset</button>
        </div>
      </fieldset>
    </form>
  );
}

export default PostSearchForm;

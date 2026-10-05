import { useState } from 'react';
import FormField from './FormField';
import { validateGroupForm, isValid, STUDY_FORMATS } from '../utils/validation';

const EMPTY_GROUP = {
  name: '',
  description: '',
  course: '',
  institution: '',
  studyFormat: '',
  maxMembers: '10'
};

// Converts a group from the server into form values (inputs hold strings)
function toForm(group) {
  return {
    name: group.name,
    description: group.description || '',
    course: group.course,
    institution: group.institution || '',
    studyFormat: group.studyFormat,
    maxMembers: String(group.maxMembers)
  };
}

// One form for both "create group" and "edit group".
// onSubmit receives clean data and must return a promise (the AJAX call).
function GroupForm({ group, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(group ? toForm(group) : EMPTY_GROUP);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // [REQ-24] Client-side validation before sending anything
    const newErrors = validateGroupForm(form);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    setSending(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        course: form.course.trim(),
        institution: form.institution.trim(),
        studyFormat: form.studyFormat,
        maxMembers: Number(form.maxMembers) // the server expects a real number
      });
    } catch {
      // e.g. "This name is already in use" - shown by the global ajaxError toast
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField label="Group name *" name="name" value={form.name} onChange={handleChange} error={errors.name} maxLength={60} />
      <FormField label="Course *" name="course" value={form.course} onChange={handleChange} error={errors.course} maxLength={60} placeholder="e.g. Calculus 1" />
      <FormField label="Study format *" name="studyFormat" value={form.studyFormat} onChange={handleChange} error={errors.studyFormat} options={STUDY_FORMATS} />
      <FormField label="Max members *" name="maxMembers" type="number" value={form.maxMembers} onChange={handleChange} error={errors.maxMembers} min={2} max={100} />
      <FormField label="Institution" name="institution" value={form.institution} onChange={handleChange} error={errors.institution} maxLength={80} />
      <FormField label="Description" name="description" multiline value={form.description} onChange={handleChange} error={errors.description} maxLength={500} />
      <div className="button-row">
        <button className="btn" type="submit" disabled={sending}>{sending ? 'Saving...' : submitLabel}</button>
        <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default GroupForm;

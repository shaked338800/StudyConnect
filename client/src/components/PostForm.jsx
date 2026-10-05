import { useState } from 'react';
import FormField from './FormField';
import VideoPlayer from './VideoPlayer';
import { validatePostForm, isValid, VIDEO_URL_REGEX } from '../utils/validation';

const EMPTY_POST = { title: '', content: '', course: '', videoUrl: '', group: '' };

function toForm(post) {
  return {
    title: post.title,
    content: post.content,
    course: post.course,
    videoUrl: post.videoUrl || '',
    group: ''
  };
}

// One form for "new post" and "edit post".
// - post:         when given, the form edits this post
// - groupOptions: when given (only for new posts), shows a group <select>
//                 with [{ value: groupId, label: groupName }, ...]
// - onSubmit:     receives clean data, must return a promise (the AJAX call)
function PostForm({ post, groupOptions, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(post ? toForm(post) : EMPTY_POST);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // [REQ-24] Client-side validation before sending anything
    const newErrors = validatePostForm(form);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    const data = {
      title: form.title.trim(),
      content: form.content.trim(),
      course: form.course.trim(),
      videoUrl: form.videoUrl.trim()
    };
    if (groupOptions && form.group) {
      data.group = form.group;
    }

    setSending(true);
    try {
      await onSubmit(data);
    } catch {
      // e.g. "You must be a member of this group" - global ajaxError toast
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField label="Title *" name="title" value={form.title} onChange={handleChange} error={errors.title} maxLength={100} />
      <FormField label="Course *" name="course" value={form.course} onChange={handleChange} error={errors.course} maxLength={60} placeholder="e.g. Algorithms" />
      <FormField label="Content *" name="content" multiline value={form.content} onChange={handleChange} error={errors.content} maxLength={5000} />
      <FormField label="Video URL (.mp4 / .webm, optional)" name="videoUrl" value={form.videoUrl} onChange={handleChange} error={errors.videoUrl} maxLength={500} placeholder="https://example.com/lecture.mp4" />
      <p className="muted small field-hint">
        Sample videos included with the app: <code>/videos/flower.mp4</code> or <code>/videos/flower.webm</code>
      </p>
      {/* [REQ-26] Live preview once the URL looks like a video file */}
      {VIDEO_URL_REGEX.test(form.videoUrl.trim()) && (
        <div className="video-preview">
          <p className="muted small">Preview:</p>
          <VideoPlayer key={form.videoUrl.trim()} src={form.videoUrl.trim()} />
        </div>
      )}
      {groupOptions && (
        <FormField label="Post in group (optional)" name="group" value={form.group} onChange={handleChange}
          options={groupOptions} emptyLabel="No group - a standalone post" />
      )}
      <div className="button-row">
        <button className="btn" type="submit" disabled={sending}>{sending ? 'Saving...' : submitLabel}</button>
        <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default PostForm;

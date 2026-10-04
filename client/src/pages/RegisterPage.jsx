import { useState } from 'react';
import FormField from '../components/FormField';
import { register } from '../api/authApi';
import { validateRegisterForm, isValid } from '../utils/validation';
import { notify } from '../jquery/notify';

const EMPTY_FORM = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  institution: '',
  fieldOfStudy: '',
  bio: ''
};

// [REQ-19 User - Create]
function RegisterPage({ onLoggedIn, onNavigate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = validateRegisterForm(form);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    setSending(true);
    try {
      // confirmPassword is only checked on the client - it is not sent
      const data = await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        institution: form.institution.trim(),
        fieldOfStudy: form.fieldOfStudy.trim(),
        bio: form.bio.trim()
      });
      notify('Account created. Welcome, ' + data.user.fullName + '!', 'success');
      onLoggedIn(data.user); // the server already logged us in
    } catch {
      // e.g. "This username is already in use" - shown by the global ajaxError toast
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="card form-card">
      <h2>Create an account</h2>
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Username *" name="username" value={form.username} onChange={handleChange} error={errors.username} maxLength={20} />
        <FormField label="Email *" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} maxLength={100} />
        <FormField label="Password *" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} maxLength={72} />
        <FormField label="Confirm password *" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} maxLength={72} />
        <FormField label="Full name *" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} maxLength={60} />
        <FormField label="Institution" name="institution" value={form.institution} onChange={handleChange} error={errors.institution} maxLength={80} />
        <FormField label="Field of study" name="fieldOfStudy" value={form.fieldOfStudy} onChange={handleChange} error={errors.fieldOfStudy} maxLength={80} />
        <FormField label="Bio" name="bio" multiline value={form.bio} onChange={handleChange} error={errors.bio} maxLength={300} />
        <button className="btn" type="submit" disabled={sending}>
          {sending ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="muted">
        Already registered?{' '}
        <button className="link-button" onClick={() => onNavigate('login')}>Login</button>
      </p>
    </section>
  );
}

export default RegisterPage;

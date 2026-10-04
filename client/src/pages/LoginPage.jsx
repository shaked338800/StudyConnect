import { useState } from 'react';
import FormField from '../components/FormField';
import { login } from '../api/authApi';
import { validateLoginForm, isValid } from '../utils/validation';
import { notify } from '../jquery/notify';

function LoginPage({ onLoggedIn, onNavigate }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // 1. Client-side validation
    const newErrors = validateLoginForm(form);
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    // 2. jQuery AJAX request to the server
    setSending(true);
    try {
      const data = await login(form.username.trim(), form.password);
      notify('Welcome back, ' + data.user.fullName + '!', 'success');
      onLoggedIn(data.user);
    } catch {
      // Server errors (e.g. wrong password) are shown by the global ajaxError toast
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="card form-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} maxLength={20} />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} maxLength={72} />
        <button className="btn" type="submit" disabled={sending}>
          {sending ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="muted">
        No account yet?{' '}
        <button className="link-button" onClick={() => onNavigate('register')}>Register</button>
      </p>
    </section>
  );
}

export default LoginPage;

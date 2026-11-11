import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/authSlice';
import { ErrorBox } from '../components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [problems, setProblems] = useState({});

  if (user) return <Navigate to="/" replace />;

  const onSubmit = (e) => {
    e.preventDefault();
    const p = {};
    if (!EMAIL_RE.test(form.email)) p.email = 'Enter a valid email';
    if (!form.password) p.password = 'Password is required';
    setProblems(p);
    if (Object.keys(p).length === 0) dispatch(login(form));
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={onSubmit} noValidate>
        <div className="logo logo-dark">LedgerPro<span>Staff</span></div>
        <h1>Staff sign in</h1>
        <ErrorBox message={error} />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="username" />
        {problems.email && <p className="field-error">{problems.email}</p>}
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={form.password} onChange={set('password')} autoComplete="current-password" />
        {problems.password && <p className="field-error">{problems.password}</p>}
        <button className="btn btn-block" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

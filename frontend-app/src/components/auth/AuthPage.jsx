import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, HardHat, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const portalConfig = {
  citizen: { label: 'Citizen portal', icon: UserRound, dashboard: '/citizen/dashboard' },
  worker: { label: 'Field worker portal', icon: HardHat, dashboard: '/worker/dashboard' },
  supervisor: { label: 'Supervisor portal', icon: HardHat, dashboard: '/worker/dashboard' },
  admin: { label: 'Admin command portal', icon: ShieldCheck, dashboard: '/admin/dashboard' },
};

export default function AuthPage({ mode = 'login' }) {
  const { role = 'citizen' } = useParams();
  const config = portalConfig[role] || portalConfig.citizen;
  const Icon = config.icon;
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: location.state?.email || '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUp(form);
      } else {
        await signIn({ email: form.email, password: form.password, role });
      }
      navigate(config.dashboard, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-civic-bg dark:bg-[#0B1220] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 text-navy-900 dark:text-white font-bold">
          <span className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-cyan-400" /></span>
          CivicPulse <span className="text-brand-500">AI</span>
        </Link>
        <section className="bg-white dark:bg-[#111C2F] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-elevation p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600"><Icon className="w-6 h-6" /></span>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Secure access</p>
              <h1 className="text-2xl font-bold text-navy-900 dark:text-white">{config.label}</h1>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <Field label="Full name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
                <Field label="Phone (optional)" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
              </>
            )}
            <Field label="Email address" type="email" autoComplete="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
            <Field label="Password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={form.password} onChange={(value) => setForm({ ...form, password: value })} required minLength={8} />
            {error && <p className="rounded-lg bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 text-sm">{error}</p>}
            <button disabled={submitting} className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-3 font-semibold flex items-center justify-center gap-2">
              {submitting ? 'Please wait...' : mode === 'signup' ? 'Create citizen account' : 'Sign in'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            {mode === 'signup' ? 'Already have an account? ' : 'New citizen? '}
            <Link className="text-brand-600 font-semibold hover:underline" to={mode === 'signup' ? '/login/citizen' : '/signup'}>
              {mode === 'signup' ? 'Sign in' : 'Create an account'}
            </Link>
          </div>
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
            {mode === 'login' && (
              <span>Choose another portal: <Link className="text-brand-600 hover:underline" to="/login/citizen">Citizen</Link> · <Link className="text-brand-600 hover:underline" to="/login/worker">Worker</Link> · <Link className="text-brand-600 hover:underline" to="/login/supervisor">Supervisor</Link> · <Link className="text-brand-600 hover:underline" to="/login/admin">Admin</Link></span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, type = 'text', value, onChange, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">{label}</span>
      <input {...props} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0B132B] px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500" />
    </label>
  );
}

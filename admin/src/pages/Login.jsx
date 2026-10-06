import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { USER_APP_URL } from "../api/client.js";
import { ErrorState } from "../components/States.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl" />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-elevated ring-1 ring-white/10">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold text-white">Admin console</h1>
          <p className="mt-1.5 text-sm text-slate-400">Restricted area. Sign in with an administrator account.</p>
        </div>

        <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-7 shadow-elevated">
          {error && <ErrorState message={error} />}
          <div>
            <label className="label" htmlFor="email">Admin email</label>
            <input id="email" type="email" className="input" placeholder="admin@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <input id="password" type={show ? "text" : "password"} className="input pr-11" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-slate-600" aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Verifying..." : <>Sign in to admin <ArrowRight className="h-4 w-4" /></>}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" /> Only accounts with the admin role can sign in here.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Not an admin?{" "}
          <a href={USER_APP_URL} className="font-semibold text-brand-300 hover:text-brand-200">Go to the Issue Tracker</a>
        </p>
      </div>
    </div>
  );
}

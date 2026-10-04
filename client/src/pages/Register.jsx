import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { ErrorState } from "../components/States.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast("Your account has been created");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Join your team's workspace in under a minute.">
      <form onSubmit={submit} className="space-y-5">
        {error && <ErrorState message={error} />}
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" className="input" placeholder="Jane Smith" value={form.name} onChange={set("name")} required minLength={2} autoComplete="name" autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="email">Work email</label>
          <input id="email" type="email" className="input" placeholder="you@company.com" value={form.email} onChange={set("email")} required autoComplete="email" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={set("password")} required minLength={6} autoComplete="new-password" />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" className="input" placeholder="Repeat password" value={form.confirm} onChange={set("confirm")} required minLength={6} autoComplete="new-password" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Creating account..." : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">Sign in</Link>
      </p>
    </AuthShell>
  );
}

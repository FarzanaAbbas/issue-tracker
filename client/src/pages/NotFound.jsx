import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-slate-200">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you are looking for does not exist or has been moved.</p>
      <Link to="/dashboard" className="btn-primary mt-8">Back to dashboard</Link>
    </div>
  );
}

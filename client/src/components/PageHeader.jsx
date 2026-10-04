import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Page title with optional breadcrumb trail and right-aligned actions.
export default function PageHeader({ title, description, breadcrumbs = [], actions }) {
  return (
    <div className="mb-8">
      {breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center gap-1.5 text-[13px] text-slate-500" aria-label="Breadcrumb">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
              {b.to ? (
                <Link to={b.to} className="hover:text-slate-800">{b.label}</Link>
              ) : (
                <span className="max-w-[240px] truncate font-medium text-slate-700">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-[28px]">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

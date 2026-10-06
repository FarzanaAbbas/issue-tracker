import { Ban, CheckCircle2, ShieldCheck } from "lucide-react";

const pill = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset";

export function RoleBadge({ role }) {
  return role === "admin" ? (
    <span className={`${pill} bg-ink-900 text-white ring-ink-900`}>
      <ShieldCheck className="h-3.5 w-3.5" /> Admin
    </span>
  ) : (
    <span className={`${pill} bg-slate-50 text-slate-600 ring-slate-500/20`}>User</span>
  );
}

export function AccountStatusBadge({ active }) {
  return active ? (
    <span className={`${pill} bg-emerald-50 text-emerald-700 ring-emerald-600/20`}>
      <CheckCircle2 className="h-3.5 w-3.5" /> Active
    </span>
  ) : (
    <span className={`${pill} bg-red-50 text-red-700 ring-red-600/20`}>
      <Ban className="h-3.5 w-3.5" /> Deactivated
    </span>
  );
}

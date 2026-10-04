import { CheckCheck } from "lucide-react";

export default function Logo({ light = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm ring-1 ring-white/10">
        <CheckCheck className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className={`font-display text-[17px] font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
        Issue<span className={light ? "text-brand-300" : "text-brand-600"}>Tracker</span>
      </span>
    </span>
  );
}

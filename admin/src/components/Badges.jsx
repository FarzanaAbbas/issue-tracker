import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { PRIORITY_LABEL, STATUS_LABEL } from "../lib/format.js";

const STATUS_STYLE = {
  OPEN: { chip: "bg-sky-50 text-sky-700 ring-sky-600/20", dot: "bg-sky-500" },
  IN_PROGRESS: { chip: "bg-amber-50 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" },
  CLOSED: { chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
};

const PRIORITY_STYLE = {
  HIGH: { cls: "text-red-700", Icon: ArrowUp },
  MEDIUM: { cls: "text-amber-700", Icon: ArrowRight },
  LOW: { cls: "text-slate-500", Icon: ArrowDown },
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const { cls, Icon } = PRIORITY_STYLE[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cls}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

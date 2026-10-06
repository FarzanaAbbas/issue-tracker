import { initials } from "../lib/format.js";

const PALETTE = [
  "bg-brand-100 text-brand-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-violet-100 text-violet-800",
  "bg-cyan-100 text-cyan-800",
];

// Stable color per name so the same person always looks the same.
function colorFor(name = "") {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

const SIZES = { xs: "h-6 w-6 text-[10px]", sm: "h-8 w-8 text-xs", md: "h-9 w-9 text-xs", lg: "h-10 w-10 text-sm" };

export default function Avatar({ name, size = "sm" }) {
  return (
    <span
      title={name}
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold ${SIZES[size]} ${colorFor(name)}`}
    >
      {initials(name)}
    </span>
  );
}

export function UserCell({ user, emptyLabel = "Unassigned" }) {
  if (!user) return <span className="text-sm italic text-slate-400">{emptyLabel}</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar name={user.name} size="xs" />
      <span className="truncate text-sm text-slate-700">{user.name}</span>
    </span>
  );
}

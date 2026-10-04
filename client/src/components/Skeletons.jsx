// Shimmering placeholders shown while data loads, shaped like the real content.

export function Skel({ className = "" }) {
  return <span className={`block animate-pulse rounded-md bg-slate-200/80 ${className}`} />;
}

function CardHeaderSkel({ width = "w-28" }) {
  return (
    <div className="card-header">
      <Skel className={`h-4 ${width}`} />
    </div>
  );
}

export function PageHeaderSkeleton({ withAction = true }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4" aria-hidden="true">
      <div className="space-y-3">
        <Skel className="h-3 w-32" />
        <Skel className="h-8 w-64" />
        <Skel className="h-4 w-80 max-w-full" />
      </div>
      {withAction && <Skel className="h-10 w-32 rounded-lg" />}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 sm:p-6">
            <Skel className="h-10 w-10 rounded-lg" />
            <Skel className="mt-5 h-3 w-20" />
            <Skel className="mt-3 h-8 w-14" />
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card">
          <CardHeaderSkel width="w-20" />
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <Skel className="h-4 w-40" />
                <Skel className="h-5 w-8" />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <CardHeaderSkel width="w-32" />
          <div className="space-y-6 px-6 py-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2.5">
                <div className="flex justify-between">
                  <Skel className="h-4 w-16" />
                  <Skel className="h-4 w-12" />
                </div>
                <Skel className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <CardHeaderSkel width="w-28" />
          <div className="flex items-center gap-6 px-6 py-6">
            <Skel className="h-28 w-28 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skel className="h-4 w-full" />
              <Skel className="h-4 w-2/3" />
              <Skel className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </section>

      <section className="card mt-6">
        <CardHeaderSkel width="w-36" />
        <ListRowsSkeleton rows={5} />
      </section>
    </div>
  );
}

export function ListRowsSkeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-slate-100" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-6 py-4">
          <div className="flex-1 space-y-2">
            <Skel className="h-4 w-3/5" />
            <Skel className="h-3 w-24" />
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Skel className="h-6 w-6 rounded-full" />
            <Skel className="h-4 w-24" />
          </div>
          <Skel className="hidden h-4 w-14 sm:block" />
          <Skel className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function IssueTableSkeleton({ rows = 6 }) {
  return (
    <div className="overflow-x-auto" aria-busy="true" aria-label="Loading issues">
      <table className="w-full min-w-[820px]">
        <thead>
          <tr className="border-y border-slate-100 bg-slate-50/70">
            {["w-16", "w-14", "w-14", "w-16", "w-16", "w-14"].map((w, i) => (
              <th key={i} className="px-6 py-3.5"><Skel className={`h-3 ${w}`} /></th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td className="px-6 py-4">
                <Skel className="h-4 w-56" />
                <Skel className="mt-2 h-3 w-20" />
              </td>
              <td className="px-6 py-4"><Skel className="h-6 w-24 rounded-full" /></td>
              <td className="px-6 py-4"><Skel className="h-4 w-14" /></td>
              <td className="px-6 py-4"><div className="flex items-center gap-2"><Skel className="h-6 w-6 rounded-full" /><Skel className="h-4 w-24" /></div></td>
              <td className="px-6 py-4"><div className="flex items-center gap-2"><Skel className="h-6 w-6 rounded-full" /><Skel className="h-4 w-24" /></div></td>
              <td className="px-6 py-4"><Skel className="h-4 w-20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IssueDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading issue">
      <div className="mb-8 space-y-3">
        <Skel className="h-3 w-48" />
        <div className="flex items-end justify-between gap-4">
          <Skel className="h-8 w-[420px] max-w-full" />
          <div className="hidden gap-3 sm:flex">
            <Skel className="h-10 w-20 rounded-lg" />
            <Skel className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
              <Skel className="h-6 w-24 rounded-full" />
              <Skel className="h-4 w-14" />
              <Skel className="ml-auto h-4 w-48" />
            </div>
            <div className="space-y-3 px-6 py-6">
              <Skel className="h-3 w-24" />
              <Skel className="h-4 w-full" />
              <Skel className="h-4 w-11/12" />
              <Skel className="h-4 w-3/5" />
            </div>
          </div>
          <div className="card">
            <CardHeaderSkel width="w-40" />
            <div className="space-y-6 px-6 py-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skel className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2 rounded-xl border border-slate-100 p-4">
                    <Skel className="h-3 w-40" />
                    <Skel className="h-4 w-4/5" />
                  </div>
                </div>
              ))}
              <Skel className="h-28 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {["w-16", "w-20", "w-16"].map((w, i) => (
            <div key={i} className="card">
              <CardHeaderSkel width={w} />
              <div className="space-y-3 p-4">
                <Skel className="h-10 w-full rounded-lg" />
                {i === 2 && <><Skel className="h-4 w-full" /><Skel className="h-4 w-full" /></>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="card" aria-busy="true" aria-label="Loading form">
      <div className="space-y-6 p-6 sm:p-8">
        <div className="space-y-2"><Skel className="h-3 w-12" /><Skel className="h-11 w-full rounded-lg" /></div>
        <div className="space-y-2"><Skel className="h-3 w-24" /><Skel className="h-40 w-full rounded-lg" /></div>
        <div className="grid gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2"><Skel className="h-3 w-16" /><Skel className="h-11 w-full rounded-lg" /></div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 rounded-b-xl border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8">
        <Skel className="h-10 w-20 rounded-lg" />
        <Skel className="h-10 w-36 rounded-lg" />
      </div>
    </div>
  );
}

// Shown on first load while the session is being checked (no cached user yet).
export function AppShellSkeleton() {
  return (
    <div className="min-h-screen lg:flex" aria-busy="true" aria-label="Loading">
      <aside className="hidden w-64 shrink-0 bg-ink-900 lg:block">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
          <span className="h-9 w-9 animate-pulse rounded-lg bg-white/10" />
          <span className="h-4 w-28 animate-pulse rounded bg-white/10" />
        </div>
        <div className="space-y-3 px-5 py-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="block h-4 w-40 animate-pulse rounded bg-white/10" />
          ))}
        </div>
      </aside>
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <PageHeaderSkeleton />
          <DashboardSkeleton />
        </div>
      </main>
    </div>
  );
}

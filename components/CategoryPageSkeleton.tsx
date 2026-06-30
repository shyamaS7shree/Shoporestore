export default function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-white px-4 pb-16 pt-[102px] md:px-6" role="status" aria-label="Loading category">
      <div className="category-skeleton mb-6 h-3 w-56 rounded-full" />
      <div className="mx-auto flex max-w-[1500px] gap-7">
        <aside className="hidden w-[260px] shrink-0 space-y-5 lg:block">
          <div className="category-skeleton h-5 w-20 rounded-full" />
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="border-b border-slate-100 pb-4">
              <div className="category-skeleton h-4 w-32 rounded-full" />
            </div>
          ))}
        </aside>
        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="category-skeleton h-6 w-48 rounded-full" />
              <div className="category-skeleton h-3 w-24 rounded-full" />
            </div>
            <div className="category-skeleton h-10 w-44 rounded-full" />
          </div>
          <div className="mb-7 flex gap-2 overflow-hidden">
            {[72, 88, 64, 96, 76].map((width, index) => (
              <div key={index} className="category-skeleton h-8 shrink-0 rounded-full" style={{ width }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index}>
                <div className="category-skeleton aspect-[3/4] rounded-xl" />
                <div className="category-skeleton mt-3 h-3 w-2/5 rounded-full" />
                <div className="category-skeleton mt-2 h-3 w-4/5 rounded-full" />
                <div className="category-skeleton mt-3 h-4 w-3/5 rounded-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
      <span className="sr-only">Loading products…</span>
    </div>
  );
}

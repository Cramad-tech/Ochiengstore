export default function AdminLoading() {
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-[rgba(248,247,242,0.92)] backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-16">
          <span className="absolute inset-0 rounded-full border-4 border-primary/12" />
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-accent" />
        </div>
        <div className="text-center">
          <p className="font-heading text-xl font-semibold text-foreground">Loading admin workspace</p>
          <p className="mt-2 text-sm text-muted-foreground">Preparing catalog, users, support, and reporting controls.</p>
        </div>
      </div>
    </div>
  )
}

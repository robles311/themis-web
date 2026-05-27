export default function ChatLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header skeleton */}
      <div className="border-b bg-card px-6 py-4">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-3 w-32 animate-pulse rounded bg-muted" />
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Assistant message skeleton */}
          <div className="flex gap-4">
            <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="max-w-[80%] space-y-2 rounded-2xl border bg-card px-5 py-3">
              <div className="h-3 w-64 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
              <div className="h-3 w-56 animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* User message skeleton */}
          <div className="flex justify-end gap-4">
            <div className="max-w-[60%] space-y-2 rounded-2xl bg-muted px-5 py-3">
              <div className="h-3 w-40 animate-pulse rounded bg-muted/70" />
            </div>
            <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-muted" />
          </div>

          {/* Assistant message skeleton */}
          <div className="flex gap-4">
            <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="max-w-[80%] space-y-2 rounded-2xl border bg-card px-5 py-3">
              <div className="h-3 w-72 animate-pulse rounded bg-muted" />
              <div className="h-3 w-56 animate-pulse rounded bg-muted" />
              <div className="h-3 w-64 animate-pulse rounded bg-muted" />
              <div className="h-3 w-44 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>

      {/* Input skeleton */}
      <div className="border-t bg-card px-4 py-4 lg:px-6">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <div className="h-[48px] flex-1 animate-pulse rounded-xl bg-muted" />
          <div className="h-[48px] w-[48px] animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

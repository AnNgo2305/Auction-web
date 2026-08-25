import { Skeleton } from '@/shared/ui/skeleton.tsx';

export function ChatPanelSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b px-5">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ml-3 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-4 p-5">
        <div className="flex justify-start">
          <Skeleton className="h-10 w-48 rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-64 rounded-2xl" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-16 w-72 rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40 rounded-2xl" />
        </div>
      </div>
      <div className="border-t p-4">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

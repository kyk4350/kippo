import Skeleton from '@/components/common/Skeleton';

export default function PostSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {/* Author */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Image */}
      <Skeleton className="h-64 w-full rounded-2xl" />

      {/* Actions */}
      <div className="flex items-center gap-6">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

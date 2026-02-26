export default function SkeletonCard() {
  return (
    <div className="w-full h-48 rounded-3xl bg-white/5 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      <div className="p-6 space-y-4">
        <div className="h-4 w-1/4 bg-white/10 rounded-md" />
        <div className="h-8 w-3/4 bg-white/10 rounded-md" />
        <div className="h-4 w-1/2 bg-white/10 rounded-md" />
      </div>
    </div>
  );
}

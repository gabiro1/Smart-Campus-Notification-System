// When a student has no notifications, don't show a blank screen
export default function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-10">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-3xl">
        📭
      </div>
      <h3 className="text-xl font-bold text-white">All caught up!</h3>
      <p className="text-neutral-500 mt-2 max-w-xs">{message}</p>
    </div>
  );
}

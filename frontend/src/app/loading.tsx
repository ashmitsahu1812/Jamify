export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#121212] gap-4 mt-20">
      <div className="w-12 h-12 border-4 border-zinc-800 border-t-[#1ED760] rounded-full animate-spin"></div>
      <p className="text-zinc-400 font-semibold animate-pulse">Loading Jamify...</p>
    </div>
  );
}

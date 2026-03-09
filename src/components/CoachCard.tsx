import { Doc } from "../../convex/_generated/dataModel";

interface CoachCardProps {
  coach: Doc<"coaches">;
  onSelect: () => void;
  hasConversation?: boolean;
}

const coachGradients: Record<string, string> = {
  SS: "from-blue-500 to-blue-600",
  JC: "from-emerald-500 to-emerald-600",
  NR: "from-purple-500 to-purple-600",
  BB: "from-rose-500 to-rose-600",
  AH: "from-amber-500 to-amber-600",
};

export function CoachCard({ coach, onSelect, hasConversation }: CoachCardProps) {
  const gradient = coachGradients[coach.avatar] || "from-gray-500 to-gray-600";

  return (
    <button
      onClick={onSelect}
      className="group relative w-full text-left p-5 md:p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden"
    >
      {/* Hover effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      {/* Status indicator */}
      {hasConversation && (
        <div className="absolute top-3 right-3 md:top-4 md:right-4 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}

      <div className="relative">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base md:text-lg mb-3 md:mb-4 shadow-lg`}>
          {coach.avatar}
        </div>

        <h3 className="text-base md:text-lg font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">
          {coach.name}
        </h3>
        <p className="text-xs md:text-sm text-amber-500/80 font-medium mb-2">{coach.title}</p>
        <p className="text-xs md:text-sm text-gray-500">{coach.expertise}</p>

        <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm text-gray-400 group-hover:text-amber-400 transition-colors">
          <span>Start conversation</span>
          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </button>
  );
}

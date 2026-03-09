import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

interface PlanViewProps {
  plan: Doc<"plans"> | null | undefined;
  profile: Doc<"userProfiles">;
}

export function PlanView({ plan, profile }: PlanViewProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const revealPlan = useMutation(api.plans.reveal);

  const handleReveal = async () => {
    setIsRevealing(true);
    try {
      await revealPlan();
    } finally {
      setIsRevealing(false);
    }
  };

  if (!plan) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 md:w-10 md:h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-3">Your plan is being created...</h2>
        <p className="text-gray-400 text-sm md:text-base">Our AI coaches are crafting a personalized roadmap for you.</p>
      </div>
    );
  }

  // Paywall for unrevealed plan
  if (!plan.isRevealed) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 mb-4 md:mb-6 shadow-xl shadow-amber-500/20">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">Your Plan is Ready!</h2>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
            We've crafted a personalized roadmap to help you achieve: <span className="text-amber-400 font-medium">{profile.mainGoal}</span>
          </p>
        </div>

        {/* Blurred preview */}
        <div className="relative mb-8 md:mb-12 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f] z-10" />
          <div className="blur-md opacity-50 p-6 md:p-8 bg-white/5 rounded-2xl">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Week 1: Foundation</h3>
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
              <div className="h-4 bg-white/10 rounded w-2/3" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mt-6 mb-4">Week 2: Momentum</h3>
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          </div>
        </div>

        {/* Unlock button */}
        <div className="text-center">
          <button
            onClick={handleReveal}
            disabled={isRevealing}
            className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-base md:text-lg rounded-xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              {isRevealing ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Revealing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Reveal My Plan
                </>
              )}
            </span>
          </button>
          <p className="mt-4 text-xs md:text-sm text-gray-500">
            Free during beta · Premium features coming soon
          </p>
        </div>
      </div>
    );
  }

  // Revealed plan
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-white">{plan.title}</h2>
            <p className="text-sm text-gray-500">Your 4-week action plan</p>
          </div>
          <div className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs md:text-sm font-medium rounded-full self-start sm:self-auto">
            In Progress
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full w-1/4 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full" />
        </div>
        <p className="text-xs text-gray-500 mt-2">Week 1 of 4</p>
      </div>

      {/* Plan steps */}
      <div className="space-y-4 md:space-y-6">
        {plan.steps.map((step: { week: number; title: string; description: string; tasks: string[] }, index: number) => (
          <div
            key={index}
            className={`p-4 md:p-6 rounded-2xl border transition-all ${
              index === 0
                ? "bg-gradient-to-br from-amber-500/10 to-purple-500/10 border-amber-500/20"
                : "bg-white/5 border-white/5"
            }`}
          >
            <div className="flex items-start gap-3 md:gap-4">
              <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-base md:text-lg ${
                index === 0
                  ? "bg-amber-500 text-white"
                  : "bg-white/10 text-gray-400"
              }`}>
                {step.week}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-gray-400 mb-3 md:mb-4">{step.description}</p>

                <div className="space-y-2">
                  {step.tasks.map((task: string, taskIndex: number) => (
                    <label
                      key={taskIndex}
                      className="flex items-start gap-3 p-2.5 md:p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 w-4 h-4 md:w-5 md:h-5 rounded border-2 border-gray-600 bg-transparent checked:bg-amber-500 checked:border-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Motivation quote */}
      <div className="mt-8 md:mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-amber-500/10 border border-purple-500/20 text-center">
        <p className="text-lg md:text-xl text-white italic mb-4">
          "The secret of getting ahead is getting started."
        </p>
        <p className="text-sm text-amber-400 font-medium">— Mark Twain</p>
      </div>
    </div>
  );
}

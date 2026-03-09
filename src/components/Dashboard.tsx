import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CoachCard } from "./CoachCard";
import { ChatView } from "./ChatView";
import { PlanView } from "./PlanView";
import { Doc, Id } from "../../convex/_generated/dataModel";

type View = "coaches" | "plan" | "chat";

interface DashboardProps {
  profile: Doc<"userProfiles">;
}

export function Dashboard({ profile }: DashboardProps) {
  const { signOut } = useAuthActions();
  const [currentView, setCurrentView] = useState<View>("coaches");
  const [selectedCoachId, setSelectedCoachId] = useState<Id<"coaches"> | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const coaches = useQuery(api.coaches.listOfficial);
  const plan = useQuery(api.plans.get);
  const conversations = useQuery(api.conversations.list);
  const getOrCreateConversation = useMutation(api.conversations.getOrCreate);

  const handleCoachSelect = async (coachId: Id<"coaches">) => {
    const conversationId = await getOrCreateConversation({ coachId });
    setSelectedCoachId(coachId);
    setSelectedConversationId(conversationId);
    setCurrentView("chat");
    setMobileMenuOpen(false);
  };

  const handleBackToCoaches = () => {
    setCurrentView("coaches");
    setSelectedCoachId(null);
    setSelectedConversationId(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-lg font-bold text-white">Board of Directors</h1>
              <p className="text-xs text-gray-500">Welcome back, {profile.name}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setCurrentView("coaches")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === "coaches"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Coaches
            </button>
            <button
              onClick={() => setCurrentView("plan")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === "plan"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              My Plan
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => signOut()}
              className="hidden sm:flex px-3 md:px-4 py-2 text-xs md:text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => { setCurrentView("coaches"); setMobileMenuOpen(false); }}
                className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-all ${
                  currentView === "coaches"
                    ? "bg-amber-500 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Coaches
              </button>
              <button
                onClick={() => { setCurrentView("plan"); setMobileMenuOpen(false); }}
                className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-all ${
                  currentView === "plan"
                    ? "bg-amber-500 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                My Plan
              </button>
              <button
                onClick={() => signOut()}
                className="w-full px-4 py-3 rounded-xl text-left font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {currentView === "coaches" && (
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {/* Goal banner */}
            <div className="mb-6 md:mb-8 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs md:text-sm text-amber-400 font-medium mb-1">Your Main Goal</p>
                  <p className="text-base md:text-lg text-white font-semibold">{profile.mainGoal}</p>
                </div>
                <button
                  onClick={() => setCurrentView("plan")}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-medium rounded-lg transition-all self-start sm:self-auto"
                >
                  View Plan →
                </button>
              </div>
            </div>

            {/* Coaches Grid */}
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-display font-bold text-white mb-1">Your Board of Directors</h2>
              <p className="text-sm text-gray-500">Select a coach to start a conversation</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {coaches?.map((coach: Doc<"coaches">) => (
                <CoachCard
                  key={coach._id}
                  coach={coach}
                  onSelect={() => handleCoachSelect(coach._id)}
                  hasConversation={conversations?.some((c: { coachId: Id<"coaches"> }) => c.coachId === coach._id)}
                />
              ))}
            </div>

            {/* Recent Conversations */}
            {conversations && conversations.length > 0 && (
              <div className="mt-8 md:mt-12">
                <h2 className="text-lg md:text-xl font-display font-bold text-white mb-4">Recent Conversations</h2>
                <div className="space-y-3">
                  {conversations.slice(0, 3).map((conv: { _id: Id<"conversations">; coachId: Id<"coaches">; coach?: Doc<"coaches"> | null; lastMessage?: { content: string } | null }) => (
                    <button
                      key={conv._id}
                      onClick={() => {
                        setSelectedCoachId(conv.coachId);
                        setSelectedConversationId(conv._id);
                        setCurrentView("chat");
                      }}
                      className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {conv.coach?.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm md:text-base">{conv.coach?.name}</p>
                        <p className="text-xs md:text-sm text-gray-500 truncate">
                          {conv.lastMessage?.content || "Start a conversation..."}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === "plan" && (
          <PlanView plan={plan} profile={profile} />
        )}

        {currentView === "chat" && selectedConversationId && selectedCoachId && (
          <ChatView
            conversationId={selectedConversationId}
            coachId={selectedCoachId}
            onBack={handleBackToCoaches}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center border-t border-white/5">
        <p className="text-xs text-gray-600">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

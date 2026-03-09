import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { Dashboard } from "./components/Dashboard";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.profiles.get);
  const seedCoaches = useMutation(api.coaches.seedOfficialCoaches);
  const [hasSeeded, setHasSeeded] = useState(false);

  // Seed coaches on first load
  if (isAuthenticated && !hasSeeded) {
    seedCoaches();
    setHasSeeded(true);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-500/50 rounded-full animate-spin animation-delay-150" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <OnboardingScreen />;
  }

  return <Dashboard profile={profile} />;
}

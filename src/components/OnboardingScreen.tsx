import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const steps = [
  {
    title: "What's your name?",
    subtitle: "So your coaches know how to address you",
    field: "name",
    placeholder: "Enter your name",
    type: "text",
  },
  {
    title: "Tell us about yourself",
    subtitle: "A brief bio helps personalize your coaching",
    field: "bio",
    placeholder: "I'm a software developer looking to transition into entrepreneurship...",
    type: "textarea",
  },
  {
    title: "What's your main goal?",
    subtitle: "Be specific — this drives your personalized plan",
    field: "mainGoal",
    placeholder: "Reach $10k MRR with my SaaS by Q2 2025",
    type: "text",
    examples: [
      "Reach $10k MRR",
      "Lose 20 pounds",
      "Launch my startup",
      "Write a book",
      "Learn to code",
    ],
  },
];

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    mainGoal: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const createProfile = useMutation(api.profiles.create);
  const generatePlan = useMutation(api.plans.generate);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = formData[currentStepData.field as keyof typeof formData].trim().length > 0;

  const handleNext = async () => {
    if (!canProceed) return;

    if (isLastStep) {
      setIsLoading(true);
      try {
        await createProfile(formData);
        await generatePlan();
      } catch (error) {
        console.error("Error creating profile:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleExampleClick = (example: string) => {
    setFormData((prev) => ({ ...prev, mainGoal: example }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex flex-col">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] animate-pulse animation-delay-500" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs md:text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-xs md:text-sm text-amber-500 font-medium">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
              </span>
            </div>
            <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
            <div className="mb-6 md:mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-gray-400 text-sm md:text-base">
                {currentStepData.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              {currentStepData.type === "textarea" ? (
                <textarea
                  value={formData[currentStepData.field as keyof typeof formData]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [currentStepData.field]: e.target.value }))}
                  placeholder={currentStepData.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none text-base"
                />
              ) : (
                <input
                  type={currentStepData.type}
                  value={formData[currentStepData.field as keyof typeof formData]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [currentStepData.field]: e.target.value }))}
                  placeholder={currentStepData.placeholder}
                  className="w-full px-4 py-3 md:py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-base"
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                />
              )}

              {currentStepData.examples && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Popular goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentStepData.examples.map((example) => (
                      <button
                        key={example}
                        onClick={() => handleExampleClick(example)}
                        className="px-3 py-1.5 text-xs md:text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-all"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 md:mt-8">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 md:py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium rounded-xl transition-all text-base"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                className="flex-1 py-3 md:py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : isLastStep ? (
                  "Generate My Plan"
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-6 md:w-8 bg-amber-500"
                    : index < currentStep
                    ? "bg-amber-500/50"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-xs text-gray-600">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

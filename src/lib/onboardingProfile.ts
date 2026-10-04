// MainGoal/TrackingFrequency: originally answers to the old onboarding
// wizard's own questions (removed — see lib/onboardingQuiz.ts for the
// 15-question quiz that replaced it). MainGoal survives as a type because
// the quiz's Q15 ("what's your main goal") maps onto it
// (onboardingQuiz.ts's mainGoalFromQuiz) and lib/tips.ts still reads it
// back to tailor Dashboard tips. TrackingFrequency has no quiz equivalent
// and is kept only because usePreferences.tsx's setOnboardingProfile
// signature (and the user_preferences.onboarding_frequency column) still
// expects one — Onboarding.tsx now always passes a fixed default.
export type MainGoal = 'epargner' | 'dettes' | 'comprendre' | 'autre'
export type TrackingFrequency = 'quotidien' | 'hebdomadaire' | 'mensuel'


import { Dashboard } from "@/components/Dashboard";
import OnboardingGuideBanner from "@/components/Onboarding/OnboardingGuideBanner";

const Index = () => {
  return (
    <>
      <OnboardingGuideBanner step="create-report" />
      <Dashboard />
    </>
  );
};

export default Index;


import { BuildingsOverview } from "@/components/Buildings/BuildingsOverview";
import OnboardingGuideBanner from "@/components/Onboarding/OnboardingGuideBanner";
import React from "react";

function Building() {
  return (
    <main className="flex-1">
      <OnboardingGuideBanner step="create-building" />
      <BuildingsOverview />
    </main>
  );
}

export default Building;

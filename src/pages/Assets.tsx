
import React from "react";
import Assets from "@/components/AssetsGroup/Assets";
import OnboardingGuideBanner from "@/components/Onboarding/OnboardingGuideBanner";

const AssetsPage = () => {
  return (
    <>
      <OnboardingGuideBanner step="create-asset" />
      <Assets />
    </>
  );
};

export default AssetsPage;

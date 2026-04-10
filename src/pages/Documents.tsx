import React from "react";
import Documents from "@/components/DocumentsGroup/Documents";
import OnboardingGuideBanner from "@/components/Onboarding/OnboardingGuideBanner";

const DocumentsPage = () => {
  return (
    <>
      <OnboardingGuideBanner step="upload-document" />
      <Documents />
    </>
  );
};

export default DocumentsPage;
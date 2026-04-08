import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, X } from "lucide-react";
import { useBuildingsQuery, useReferenceDataQuery } from "@/hooks/queries";

interface OrganizationWarningBarProps {
  onCreateOrganization: () => void;
  onCreateBuilding: () => void;
  onDismiss?: () => void;
}

export const OrganizationWarningBar = ({
  onCreateOrganization,
  onCreateBuilding,
  onDismiss,
}: OrganizationWarningBarProps) => {
  const { data: referenceData, isLoading: orgLoading } = useReferenceDataQuery();
  const { buildings, isLoading: buildingsLoading } = useBuildingsQuery();

  if (orgLoading || buildingsLoading) {
    return (
      <div className="bg-warning-background px-4 py-3">
        <p className="text-sm font-medium text-warning">Loading...</p>
      </div>
    );
  }

  if (!referenceData?.hasOrganization) {
    return (
      <div className="bg-warning-background border-b border-warning-border px-4 py-3">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning ">
                No organization found
              </p>
              <p className="text-xs text-warning/80">
                Create an organization to start managing your assets and issues
              </p>
            </div>
          </div>
          <Button
            onClick={onCreateOrganization}
            size="sm"
            className="bg-warning hover:bg-warning/90 text-warning-foreground"
          >
            Create Organization
          </Button>
        </div>
      </div>
    );
  }

  if (referenceData?.hasOrganization && buildings.length === 0) {
    return (
      <div className="bg-warning-background border-b border-warning-border px-4 py-3">
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-5 w-5 text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning">
                No buildings found
              </p>
              <p className="text-xs text-warning/80">
                Create a building to start managing spaces, assets and tasks
              </p>
            </div>
          </div>
          <Button
            onClick={onCreateBuilding}
            size="sm"
            className="bg-warning hover:bg-warning/90 text-warning-foreground"
          >
            Create Building
          </Button>
        </div>
      </div>
    );
  }

  return null; // if org + buildings exist, no warning bar
};

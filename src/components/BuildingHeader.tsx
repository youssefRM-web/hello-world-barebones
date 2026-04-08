import React from 'react';
import { Building } from 'lucide-react';
import { useBuilding } from '@/contexts/BuildingContext';

export const BuildingHeader: React.FC = () => {
  const { selectedBuilding } = useBuilding();

  if (!selectedBuilding) {
    return (
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="flex items-center gap-2 text-yellow-800">
          <Building className="h-4 w-4" />
          <span className="text-sm font-medium">
            Please select a building from the sidebar to view specific data
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          {selectedBuilding.photo ? (
            <img
              src={selectedBuilding.photo}
              alt={selectedBuilding.label}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {selectedBuilding.label?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <div>
          <div className="font-medium text-blue-900 text-sm">
            Viewing data for: {selectedBuilding.label}
          </div>
          <div className="text-xs text-blue-700">
            {selectedBuilding.organization_id?.name}
          </div>
        </div>
      </div>
    </div>
  );
};
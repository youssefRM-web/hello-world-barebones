import React, { createContext, useContext, useState, useEffect } from 'react';

interface BuildingSelectionState {
  selectedBuildingId: string | null;
  setSelectedBuildingId: (buildingId: string | null) => void;
}

const BuildingSelectionContext = createContext<BuildingSelectionState | undefined>(undefined);

export const useBuildingSelection = () => {
  const context = useContext(BuildingSelectionContext);
  if (!context) {
    throw new Error('useBuildingSelection must be used within a BuildingSelectionProvider');
  }
  return context;
};

export const BuildingSelectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedBuildingId, setSelectedBuildingIdState] = useState<string | null>(() => {
    // Initialize from localStorage
    return localStorage.getItem('selectedBuildingId') || null;
  });

  const setSelectedBuildingId = (buildingId: string | null) => {
    setSelectedBuildingIdState(buildingId);
    if (buildingId) {
      localStorage.setItem('selectedBuildingId', buildingId);
    } else {
      localStorage.removeItem('selectedBuildingId');
    }
  };

  return (
    <BuildingSelectionContext.Provider value={{ selectedBuildingId, setSelectedBuildingId }}>
      {children}
    </BuildingSelectionContext.Provider>
  );
};
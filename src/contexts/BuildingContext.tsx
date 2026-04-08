import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Building } from "@/types";

interface BuildingContextType {
  selectedBuilding: Building | null;
  setSelectedBuilding: React.Dispatch<React.SetStateAction<Building | null>>;
  isLoading: boolean;
}

const BuildingContext = createContext<BuildingContextType | undefined>(
  undefined
);

interface BuildingProviderProps {
  children: ReactNode;
}

export const BuildingProvider: React.FC<BuildingProviderProps> = ({
  children,
}) => {
  const [selectedBuilding, setSelectedBuildingState] =
    useState<Building | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load building from localStorage on mount
  useEffect(() => {
    const savedBuilding = localStorage.getItem("selectedBuilding");
    if (savedBuilding) {
      try {
        const building = JSON.parse(savedBuilding);
        setSelectedBuildingState({
          ...building,
          organization_id:
            building.organization_id?._id || building.organization_id,
        });
      } catch (error) {
        console.error("Failed to parse saved building:", error);
        localStorage.removeItem("selectedBuilding");
      }
    }
    setIsLoading(false);
  }, []);

  // ✅ Updated setter that supports both direct and functional updates
  const setSelectedBuilding: React.Dispatch<React.SetStateAction<Building | null>> = (
    value
  ) => {
    setSelectedBuildingState((prev) => {
      const newValue = typeof value === "function" ? (value as any)(prev) : value;

      if (newValue) {
        const serialized = {
          ...newValue,
          organization_id:
            (newValue as any).organization_id?._id ||
            (newValue as any).organization_id,
        };
        localStorage.setItem("selectedBuilding", JSON.stringify(serialized));
      } else {
        localStorage.removeItem("selectedBuilding");
      }

      return newValue;
    });
  };

  return (
    <BuildingContext.Provider
      value={{
        selectedBuilding,
        setSelectedBuilding,
        isLoading,
      }}
    >
      {children}
    </BuildingContext.Provider>
  );
};

export const useBuilding = (): BuildingContextType => {
  const context = useContext(BuildingContext);
  if (!context) {
    throw new Error("useBuilding must be used within a BuildingProvider");
  }
  return context;
};

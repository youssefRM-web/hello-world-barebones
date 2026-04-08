import type { Permission } from "@/components/Common/ProtectedRoute";

export const getFirstAvailableRoute = (permissions: Permission[]): string => {
  const routeMap: Record<Permission, string> = {
    board: "/dashboard/board",
    tasks: "/dashboard/tasks",
    spaces: "/dashboard/spaces",
    assets: "/dashboard/assets",
    documents: "/dashboard/documents",
    insights: "/dashboard/insights",
    qrCodes: "/dashboard/qr-codes",
    organisation: "/dashboard/organisation",
    buildings: "/dashboard/building",
    issues: "/dashboard"
  };

  // Return the first available route based on permissions order
  for (const permission of permissions) {
    if (routeMap[permission]) {
      return routeMap[permission];
    }
  }
  
  // Fallback to dashboard
  return "/dashboard";
};
import { api, endpoints } from "./api";
import { Permissions } from "@/types";

export interface BuildingPermissionEntry {
  buildingId: string;
  permissions: Permissions;
}

export interface UpdateUserPermissionsRequest {
  userId: string;
  buildingIds: string[];
  buildingPermissions: BuildingPermissionEntry[];
}

export interface UpdateUserBuildingAccessRequest {
  userId: string;
  buildingIds: string[];
}

export interface UserBuildingDetails {
  _id: string;
  userId: string;
  buildingId: string;
  permissions: Permissions;
  accessLevel: string;
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  // Update user permissions for specific building(s)
  updateUserPermissions: async (data: UpdateUserPermissionsRequest) => {
    const response = await api.patch(
      `${endpoints.invite}/${data.userId}/update-invitaton`,
      {
        affectedTo: data.buildingIds,
        buildingPermissions: data.buildingPermissions,
      }
    );

    return response.data;
  },

  // Get user building details and permissions
  getUserBuildingDetails: async (
    userId: string,
    buildingId: string
  ): Promise<UserBuildingDetails> => {
    const response = await api.get(
      `${endpoints.users}/${userId}/buildings/${buildingId}`
    );
    
    return response.data;
  },

  // Add building access to user
  c: async (userId: string, buildingId: string) => {
    const response = await api.patch(`${endpoints.users}/${userId}`, {
      affectedTo: [buildingId],
    });
    return response.data;
  },

  // Remove building access from user
  removeBuildingFromUser: async (userId: string, buildingId: string) => {
    const response = await api.delete(
      `${endpoints.users}/${userId}/buildings/${buildingId}`
    );
    return response.data;
  },

  // Resend user invitation
  resendInvitation: async (userId: string) => {
    const response = await api.patch(
      `${endpoints.invite}/${userId}/resend-invitation`
    );
    return response.data;
  },

  // Reset user password
  resetPassword: async (userId: string) => {
    const response = await api.post(
      `${endpoints.auth}/force-reset-password/${userId}`
    );
    return response.data;
  },

  // Revoke user access (block)
  revokeAccess: async (userId: string) => {
    const response = await api.post(
      `${endpoints.invite}/revoke-access/user/${userId}`
    );
    return response.data;
  },

  // Restore user access (unblock)
  restoreAccess: async (userId: string) => {
    const response = await api.post(
      `${endpoints.invite}/restore-access/user/${userId}`
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await api.delete(`${endpoints.users}/${userId}`);
    return response.data;
  },
};

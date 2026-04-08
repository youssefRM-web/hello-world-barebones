import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  Lock,
  Languages,
  EyeOff,
  Eye,
  User,
  LockIcon,
  LanguagesIcon,
} from "lucide-react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/Common/LanguageSelector";
import { useCurrentUserQuery } from "@/hooks/queries";
import axios from "axios";
import { apiService, apiUrl, endpoints } from "@/services/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  PasswordStrengthIndicator,
  isPasswordValid,
} from "@/components/ui/PasswordStrengthIndicator";
import { isValidEmail } from "@/utils/emailValidation";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { validateFileSize } from "@/utils/fileValidation";

const ProfileContent = () => {
  const { t } = useLanguage();
  const { data: currentUser, isLoading: userLoading } = useCurrentUserQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "profile";
  
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [removingImage, setRemovingImage] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      allActivities: {
        assignedToTask: true,
        mentionedInTask: true,
      },
      relevantActivities: {
        taskCreated: true,
        taskEdited: true,
        taskDeleted: false,
        statusChanged: true,
        commentAdded: true,
      },
    },
    inApp: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.Name || "");
      setLastName(currentUser.Last_Name || "");
      setEmail(currentUser.Email || "");
      setProfilePicture(currentUser.profile_picture || null);

      // Initialize notification settings from user data
      if (currentUser.notificationSettings) {
        setNotificationSettings(currentUser.notificationSettings);
      }
    }
  }, [currentUser]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!validateFileSize(selectedFile, t)) {
        e.target.value = "";
        return;
      }
      setUploadError("");

      // Create preview
      const previewUrl = URL.createObjectURL(selectedFile);
      setUploadPreview(previewUrl);

      // Auto-upload when file is selected
      await handleUpload(selectedFile);

      // Clear the input value to allow re-uploading the same file
      e.target.value = "";
    }
  };

  const handleUpload = async (fileToUpload?: File) => {
    const uploadFile = fileToUpload || file;
    if (!uploadFile) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      // get userInfo from localStorage
      const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = storedUserInfo?.accessToken; // adjust based on how you store it

      const { data } = await axios.post(
        `${apiUrl}/user/profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ✅ send token
          },
        },
      );

      setFile(null);

      // Update local storage with new profile picture
      const updatedUserInfo = {
        ...storedUserInfo,
        profile_picture: data.profilePictureUrl,
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      // Update local state immediately for instant UI feedback
      setProfilePicture(data.profilePictureUrl);

      // Invalidate current user query to update UI in real-time (including topbar)
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast.success(t("profile.title"), {
        description: t("profile.profilePictureUpdated"),
      });
    } catch (error) {
      setUploadError("Failed to upload image. Please try again.");
      toast.error(t("common.error"), {
        description: t("profile.failedUploadPicture"),
      });
    } finally {
      setUploading(false);
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
        setUploadPreview(null);
      }
    }
  };

  const handleRemove = async () => {
    setRemovingImage(true);
    try {
      const data = await apiService.patch(
        `${endpoints.users}/profile-picture`,
        {},
      );

      // Update local storage to remove profile picture
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const updatedUserInfo = {
        ...userInfo,
        profile_picture: null,
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      // Update local state immediately for instant UI feedback
      setProfilePicture(null);

      // Invalidate current user query to update UI in real-time (including topbar)
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast.success(t("profile.title"), {
        description: t("profile.profilePictureRemoved"),
      });
    } catch (error) {
      console.error("❌ Error removing profile picture:", error);
      toast.error(t("common.error"), {
        description: t("profile.failedRemovePicture"),
      });
    } finally {
      setRemovingImage(false);
      setUploadPreview(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!isValidEmail(email)) {
      toast.error(t("common.error"), {
        description: t("profile.invalidEmail"),
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userId = userInfo?.id;

      // Make API call to update profile
      await apiService.patch(`${endpoints.users}/${userId}/update`, {
        Name: firstName,
        Last_Name: lastName,
        Email: email,
      });

      // Update local storage with new data
      const updatedUserInfo = {
        ...userInfo,
        Name: firstName,
        Last_Name: lastName,
        Email: email,
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      // Invalidate and refetch current user query to update UI
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast.success(t("profile.title"), {
        description: t("profile.profileUpdated"),
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("common.error"), {
        description: t("profile.failedUpdateProfile"),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userId = userInfo?.id;

      await apiService.patch(`${endpoints.users}/${userId}/update`, {
        notificationSettings,
      });

      // Update local storage with new notification settings
      const updatedUserInfo = {
        ...userInfo,
        notificationSettings,
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      // Invalidate and refetch current user query to update UI
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast.success(t("profile.title"), {
        description: t("profile.notificationsUpdated"),
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error(t("common.error"), {
        description: t("profile.failedUpdateNotifications"),
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleChangePassword = async () => {
    if (!isPasswordValid(passwordData.newPassword)) {
      toast.error(t("common.error"), {
        description: t("profile.passwordRequirements"),
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("common.error"), {
        description: t("profile.passwordsDoNotMatch"),
      });
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo.accessToken;

      await axios.post(
        `${apiUrl}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(t("profile.title"), {
        description: t("profile.passwordUpdated"),
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("profile.failedUpdatePassword"),
      });
    }
  };

  if (userLoading) {
    return <PageLoadingSkeleton variant="profile" />;
  }

  return (
    <div className=" mx-auto p-4 lg:p-6">
      <Card className="border-none px-0 pt-0 space-y-6">
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={currentTab}
            onValueChange={(value) => setSearchParams({ tab: value })}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 max-w-[700px]">
              <TabsTrigger value="profile">
                {t("profile.profileTab")}
              </TabsTrigger>
              <TabsTrigger value="password">
                {t("profile.passwordTab")}
              </TabsTrigger>
              <TabsTrigger value="notifications">
                {t("profile.notificationsTab")}
              </TabsTrigger>
              <TabsTrigger value="language">
                {t("profile.languageTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6 max-w-[700px]">
              <div className="border-none px-0 py-0 space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex gap-2 items-center">
                    <User />
                    {t("profile.profilePhoto")}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20 rounded-lg">
                        {(uploadPreview || currentUser?.profile_picture) && (
                          <AvatarImage
                            src={uploadPreview || currentUser?.profile_picture}
                            alt="Profile"
                            className="rounded-lg"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <AvatarFallback className="bg-[#0F4C7BFF] text-white text-5xl rounded-lg uppercase p-1">
                          {firstName?.[0] || ""}
                          {lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      {(uploading || removingImage) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <p className="text-sm text-foreground mb-2">
                        {t("profile.uploadPhoto")}
                      </p>
                      <p className="text-xs text-foreground mb-3">
                        {t("profile.photoFormat")}
                      </p>
                      <div className="space-y-2">
                        {uploadError && (
                          <p className="text-xs text-[#DE3B40FF]">
                            {uploadError}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <label htmlFor="file-upload">
                            <Button
                              variant="outline"
                              size="lg"
                              className="cursor-pointer"
                              asChild
                              disabled={uploading || removingImage}
                            >
                              <span>
                                {uploading
                                  ? "Uploading..."
                                  : t("profile.chooseImage")}
                              </span>
                            </Button>
                          </label>
                          {profilePicture && (
                            <Button
                              variant="destructive"
                              size="lg"
                              onClick={handleRemove}
                              disabled={uploading || removingImage}
                            >
                              {removingImage ? "Removing..." : "Remove"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t("profile.firstName")}
                    </label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t("profile.firstName")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t("profile.lastName")}
                    </label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t("profile.lastName")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("profile.email")}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("profile.email")}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setFirstName(currentUser?.Name || "");
                      setLastName(currentUser?.Last_Name || "");
                      setEmail(currentUser?.Email || "");
                    }}
                    disabled={isSavingProfile}
                  >
                    {t("profile.cancel")}
                  </Button>
                  <Button
                    className="text-white"
                    size="lg"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? "Saving..." : t("profile.save")}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="password" className="mt-6 max-w-[700px]">
              <Card className="border-none px-0 py-0 space-y-3">
                <CardHeader>
                  <CardTitle className="flex text-xl font-bold items-center space-x-2">
                    <span>
                      <LockIcon />
                    </span>
                    <span>{t("profile.changePassword")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">
                      {t("profile.currentPassword")}
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder={t("profile.enterCurrentPassword")}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      {t("profile.newPassword")}
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder={t("profile.enterNewPassword")}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <PasswordStrengthIndicator
                      password={passwordData.newPassword}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      {t("profile.confirmPassword")}
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("profile.confirmNewPassword")}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="text-white"
                      size="lg"
                      onClick={handleChangePassword}
                    >
                      {t("profile.changePassword")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6 max-w-[700px]">
              <Card className="border-none px-0 py-0 space-y-6">
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Bell />
                        <h3 className="text-xl font-bold text-foreground ">
                          {t("profile.notificationSettings")}
                        </h3>
                      </div>
                      <p className="text-sm text-foreground">
                        {t("profile.notificationDescription")}
                      </p>
                    </div>

                    {/* In-App Notifications Toggle */}
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">
                          {t('profile.inApp')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('profile.inAppDes')}
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.inApp}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            inApp: checked,
                          })
                        }
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-foreground">
                          {t("profile.allActivities")}
                        </h4>
                        <span className="text-sm font-medium text-foreground">
                          Email
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">
                            {t("profile.assignedToTask")}
                          </span>
                          <Switch
                            checked={
                              notificationSettings.email.allActivities
                                .assignedToTask
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                email: {
                                  ...notificationSettings.email,
                                  allActivities: {
                                    ...notificationSettings.email.allActivities,
                                    assignedToTask: checked,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">
                            {t("profile.mentionedInTask")}
                          </span>
                          <Switch
                            checked={
                              notificationSettings.email.allActivities
                                .mentionedInTask
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                email: {
                                  ...notificationSettings.email,
                                  allActivities: {
                                    ...notificationSettings.email.allActivities,
                                    mentionedInTask: checked,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">
                        {t("profile.relevantActivities")}
                      </h4>
                      <p className="text-sm text-foreground mb-4">
                        {t("profile.relevantDescription")}
                      </p>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">
                            {t("profile.ticketCreated")}
                          </span>
                          <Switch
                            checked={
                              notificationSettings.email.relevantActivities
                                .taskCreated
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                email: {
                                  ...notificationSettings.email,
                                  relevantActivities: {
                                    ...notificationSettings.email
                                      .relevantActivities,
                                    taskCreated: checked,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">
                            {t("profile.ticketEdited")}
                          </span>
                          <Switch
                            checked={
                              notificationSettings.email.relevantActivities
                                .taskEdited
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                email: {
                                  ...notificationSettings.email,
                                  relevantActivities: {
                                    ...notificationSettings.email
                                      .relevantActivities,
                                    taskEdited: checked,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">
                            {t("profile.ticketDeleted")}
                          </span>
                          <Switch
                            checked={
                              notificationSettings.email.relevantActivities
                                .taskDeleted
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                email: {
                                  ...notificationSettings.email,
                                  relevantActivities: {
                                    ...notificationSettings.email
                                      .relevantActivities,
                                    taskDeleted: checked,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">
                            {t("profile.statusChanged")}
                          </span>
                          <Switch
                            checked={
                              notificationSettings.email.relevantActivities
                                .statusChanged
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                email: {
                                  ...notificationSettings.email,
                                  relevantActivities: {
                                    ...notificationSettings.email
                                      .relevantActivities,
                                    statusChanged: checked,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-foreground">
                            {t("profile.commentAdded")}
                          </span>
                          <Switch
                            checked={
                              notificationSettings.email.relevantActivities
                                .commentAdded
                            }
                            onCheckedChange={(checked) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                email: {
                                  ...notificationSettings.email,
                                  relevantActivities: {
                                    ...notificationSettings.email
                                      .relevantActivities,
                                    commentAdded: checked,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        className="text-white"
                        size="lg"
                        onClick={handleSaveNotifications}
                        disabled={isSavingNotifications}
                      >
                        {isSavingNotifications
                          ? "Saving..."
                          : t("profile.save")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="language" className="mt-6">
              <Card className="border-none px-0 py-0 space-y-6">
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <LanguagesIcon />
                        <h3 className="text-xl font-bold text-foreground">
                          {t("profile.displayLanguage")}
                        </h3>
                      </div>
                      <p className="text-sm text-foreground mb-4">
                        {t("profile.languageDescription")}
                      </p>
                    </div>

                    <div className="max-w-xs">
                      <LanguageSelector />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileContent;

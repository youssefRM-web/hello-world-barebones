/**
 * Validates email format
 * Rejects invalid formats like fe@.de (domain starting with dot)
 */
export const isValidEmail = (email: string): boolean => {
  // Basic email regex that ensures proper domain format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check basic format
  if (!emailRegex.test(email)) {
    return false;
  }

  // Additional check: domain should not start with a dot
  const domainPart = email.split("@")[1];
  if (domainPart && domainPart.startsWith(".")) {
    return false;
  }

  // Check for consecutive dots
  if (email.includes("..")) {
    return false;
  }

  return true;
};

export const getEmailErrorMessage = (email: string): string => {
  if (!email) {
    return "Email is required";
  }
  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }
  return "";
};

/**
 * Format date to DD.MM.YYYY format
 */
/**
 * Format date to DD.MM.YYYY using the user's local timezone
 */
export const formatDate = (date: string | Date | null): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  // Use local getters → respects browser timezone
  const day   = dateObj.getDate()    .toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year  = dateObj.getFullYear();

  return `${day}.${month}.${year}`;
};

/**
 * Format date and time to DD.MM.YYYY HH:MM in user's local timezone
 */
export const formatDateTime = (date: string | Date | null): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const formattedDate = formatDate(dateObj);

  // Local time components
  const hours   = dateObj.getHours()  .toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");

  return `${formattedDate}, ${hours}:${minutes}`;
};

export const formatTime = (date: string | Date | null): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const formattedDate = formatDate(dateObj);

  // Local time components
  const hours   = dateObj.getHours()  .toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};
export const formatDateOnly = (date: string | Date | null): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const formattedDate = formatDate(dateObj);

  // Local time components
  const hours   = dateObj.getHours()  .toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");

  return `${formattedDate}`;
};

// Capitalize and prettify enum values like TO_DO → To Do
export const prettifyValue = (val: any) => {
  if (Array.isArray(val)) {
    return `${val.join(", ")}`;
  }
  if (val === null || val === undefined) return "empty";
  return val;
};

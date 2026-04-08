import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatLocationChain = (
  locationChain: Array<{ type: string; name: string; _id: string }>
) => {
  if (!locationChain || locationChain.length === 0) return "";

  // Map only the names in order
  const names = locationChain.map((item) => item.name);

  // Join them with ' > '
  return names.join(" > ");
};

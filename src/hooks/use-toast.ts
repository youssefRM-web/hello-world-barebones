import { toast as sonnerToast } from "sonner";

// Compatibility wrapper that converts the old toast API to sonner
type ToastVariant = "default" | "success" | "destructive";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: any;
  [key: string]: any;
}

function toast(props: ToastProps) {
  const { title, description, variant, duration, ...rest } = props;

  const options: any = {};
  if (description) options.description = description;
  if (duration) options.duration = duration;

  const message = title || "";

  if (variant === "success") {
    return sonnerToast.success(message, options);
  } else if (variant === "destructive") {
    return sonnerToast.error(message, options);
  } else {
    return sonnerToast(message, options);
  }
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    },
    toasts: [] as any[],
  };
}

export { useToast, toast };

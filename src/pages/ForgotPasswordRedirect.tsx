import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Redirect page for old forgot-password links
 * Redirects to home with the correct query parameter to open the modal
 */
const ForgotPasswordRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/?reset=request", { replace: true });
  }, [navigate]);

  return null;
};

export default ForgotPasswordRedirect;
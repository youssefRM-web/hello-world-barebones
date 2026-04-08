import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Redirect page for old reset-password links with token
 * Redirects to home with the correct query parameters to open the modal
 */
const ResetPasswordRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      navigate(`/?reset=password&token=${token}`, { replace: true });
    } else {
      navigate("/?reset=request", { replace: true });
    }
  }, [navigate, token]);

  return null;
};

export default ResetPasswordRedirect;
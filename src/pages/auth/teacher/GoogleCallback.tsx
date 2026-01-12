// GoogleCallback.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Cookie from "js-cookie";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = () => {
      // Get params from URL (your backend should redirect with these)
      const accessToken = searchParams.get("accessToken");
      const isNewUser = searchParams.get("isNewUser");
      const email = searchParams.get("email");
      const error = searchParams.get("error");

      if (error) {
        toast.error("Google authentication failed", {
          position: "bottom-right",
        });
        navigate("/login");
        return;
      }

      if (!accessToken) {
        toast.error("No access token received", {
          position: "bottom-right",
        });
        navigate("/login");
        return;
      }

      // Store the Google token temporarily
      Cookie.set("google_temp_token", accessToken, { expires: 1 / 24 }); // 1 hour

      if (isNewUser === "true") {
        // New user needs to complete registration
        navigate("/phone-verification", {
          state: { email, googleToken: accessToken },
        });
      } else {
        // Existing user - direct login
        Cookie.set("token", accessToken);
        Cookie.set("role", "teacher");
        toast.success("Successfully logged in with Google", {
          position: "bottom-right",
        });
        navigate("/app/teacher/profile");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="text-center">
        <Spinner className="h-8 w-8 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">
          Completing Google sign in...
        </p>
      </div>
    </div>
  );
}

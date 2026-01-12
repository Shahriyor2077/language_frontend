import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { useSendOtp, useVerifyOtp } from "@/hooks/useGoogleAuth";

// Step 1: Phone + Password
const phoneSchema = z
  .object({
    phoneNumber: z
      .string()
      .min(9, "Phone number must be at least 9 digits")
      .regex(/^\+?[0-9]+$/, "Invalid phone number format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number and special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Step 2: Only OTP
const verifySchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function PhoneVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, googleToken: stateToken } = location.state || {};

  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const googleToken = stateToken || Cookie.get("google_temp_token") || "";

  useEffect(() => {
    if (!googleToken) {
      toast.error("Session expired. Please login again.", {
        position: "bottom-right",
      });
      navigate("/login/teacher");
    }
  }, [googleToken, navigate]);

  const { mutate: sendOtp, isPending: isSendingOtp } = useSendOtp();
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const verifyForm = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
  });

  const onPhoneSubmit = (data: z.infer<typeof phoneSchema>) => {
    // Store password for later use
    setPassword(data.password);

    sendOtp(
      {
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
        token: googleToken,
      },
      {
        onSuccess: (res) => {
          toast.success(res.message, {
            position: "bottom-right",
          });
          setPhoneNumber(data.phoneNumber);
          setStep("verify");
        },
        onError: (error: any) => {
          console.log(data);
          toast.error(error.response?.data?.message || "Failed to send OTP", {
            position: "bottom-right",
          });
        },
      }
    );
  };

  const onVerifySubmit = (data: z.infer<typeof verifySchema>) => {
    verifyOtp(
      {
        phoneNumber,
        otp: data.otp,
        token: googleToken,
        password,
      },
      {
        onSuccess: (res) => {
          toast.success(res.message, {
            position: "bottom-right",
          });

          // Clear temp token
          Cookie.remove("google_temp_token");

          // Set real tokens
          Cookie.set("token", res.accessToken);
          Cookie.set("role", "teacher");

          // Navigate to profile
          navigate("/app/teacher/profile");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to verify OTP", {
            position: "bottom-right",
          });
        },
      }
    );
  };

  if (!googleToken) {
    return null;
  }

  return (
    <div
      key={step}
      className="fixed inset-0 flex items-center justify-center bg-background"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {step === "phone" ? "Complete Registration" : "Verify Phone Number"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "phone"
              ? `Signed in as ${email}`
              : `Enter the OTP sent to ${phoneNumber}`}
          </p>
        </div>

        {step === "phone" ? (
          <Form {...phoneForm}>
            <form
              onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
              className="space-y-6"
            >
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+998901234567"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={phoneForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Create Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={phoneForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isSendingOtp}
              >
                {isSendingOtp ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Sending OTP...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...verifyForm}>
            <form
              onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
              className="space-y-6"
            >
              <FormField
                control={verifyForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP Code</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="Enter 6-digit code"
                        className="h-11 text-center tracking-widest"
                        value={field.value}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          if (digitsOnly.length <= 6) {
                            field.onChange(digitsOnly);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Verifying...
                  </span>
                ) : (
                  "Verify & Complete"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("phone")}
                disabled={isVerifying}
              >
                Change Phone Number
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}

// service/useGoogleAuth.ts
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface SendOtpRequest {
  confirmPassword: string;
  password: string;
  phoneNumber: string;
  token: string; // Google access token
}

interface SendOtpResponse {
  message: string;
  phoneNumber: string;
}

interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
  password: string;
  token: string; // Google access token
}

interface VerifyOtpResponse {
  message: string;
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  accessToken: string;
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to send OTP to phone number
 * Usage: const { mutate: sendOtp, isPending } = useSendOtp();
 */
export const useSendOtp = () => {
  return useMutation({
    mutationFn: async (data: SendOtpRequest) => {
      console.log("Sending OTP with data:", {
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      const response = await axios.post<SendOtpResponse>(
        `${API_URL}/auth/teacher/send-otp`,
        {
          phoneNumber: data.phoneNumber,
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );
      return response.data;
    },
  });
};

/**
 * Hook to verify OTP and set password
 * Usage: const { mutate: verifyOtp, isPending } = useVerifyOtp();
 */
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (data: VerifyOtpRequest) => {
      const response = await axios.post<VerifyOtpResponse>(
        `${API_URL}/auth/teacher/verify-otp`,
        {
          phoneNumber: data.phoneNumber,
          otp: data.otp,
        },
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );
      return response.data;
    },
  });
};

// Export types for use in components
export type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
};

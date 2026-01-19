
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface SendOtpRequest {
  confirmPassword: string;
  password: string;
  phoneNumber: string;
  token: string; 
}

interface SendOtpResponse {
  message: string;
  phoneNumber: string;
}

interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
  password: string;
  token: string; 
}

interface VerifyOtpResponse {
  message: string;
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  accessToken: string;
}


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

export type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
};

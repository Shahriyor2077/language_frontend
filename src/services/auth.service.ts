import { request } from "@/config/request";
import type { LoginDto, AuthResponse, Admin } from "@/types";

export const authService = {
    // Admin login
    adminLogin: async (data: LoginDto): Promise<AuthResponse> => {
        const response = await request.post("/auth/admin/login", data);
        return response.data;
    },

    // Admin logout
    adminLogout: async (): Promise<{ message: string }> => {
        const response = await request.post("/auth/admin/logout");
        return response.data;
    },

    // Refresh admin token
    adminRefresh: async (): Promise<{ message: string; accessToken: string }> => {
        const response = await request.post("/auth/admin/refresh");
        return response.data;
    },

    // Get admin profile
    getAdminProfile: async (): Promise<Admin> => {
        const response = await request.get("/auth/admin/me");
        return response.data;
    },

    // Update admin profile
    updateAdminProfile: async (data: {
        username?: string;
        phoneNumber?: string;
    }): Promise<{ message: string; admin: Admin }> => {
        const response = await request.patch("/auth/admin/me", data);
        return response.data;
    },
};

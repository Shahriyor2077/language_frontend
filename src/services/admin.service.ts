import { request } from "@/config/request";
import type {
    Admin,
    AdminQueryParams,
    CreateAdminDto,
    UpdateAdminDto,
    PaginatedResponse,
} from "@/types";

export const adminService = {
    // Get all admins
    getAll: async (params?: AdminQueryParams): Promise<PaginatedResponse<Admin>> => {
        const response = await request.get("/admins", { params });
        return response.data;
    },

    // Get admin by ID
    getById: async (id: string): Promise<Admin> => {
        const response = await request.get(`/admins/${id}`);
        return response.data.data;
    },

    // Create admin (superAdmin only)
    create: async (data: CreateAdminDto): Promise<Admin> => {
        const response = await request.post("/admins", data);
        return response.data;
    },

    // Update admin
    update: async (id: string, data: UpdateAdminDto): Promise<Admin> => {
        const response = await request.patch(`/admins/${id}`, data);
        return response.data;
    },

    // Delete admin (soft delete)
    delete: async (id: string): Promise<void> => {
        await request.delete(`/admins/${id}`);
    },

    // Restore admin
    restore: async (id: string): Promise<Admin> => {
        const response = await request.patch(`/admins/${id}/restore`);
        return response.data;
    },

    // Activate admin
    activate: async (id: string): Promise<Admin> => {
        const response = await request.patch(`/admins/${id}/activate`);
        return response.data;
    },

    // Deactivate admin
    deactivate: async (id: string): Promise<Admin> => {
        const response = await request.patch(`/admins/${id}/deactivate`);
        return response.data;
    },

    // Change password
    changePassword: async (
        id: string,
        data: { currentPassword: string; newPassword: string; confirmPassword: string }
    ): Promise<Admin> => {
        const response = await request.patch(`/admins/${id}/change-password`, data);
        return response.data;
    },
};

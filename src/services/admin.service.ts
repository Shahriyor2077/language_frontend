import { request } from "@/config/request";
import type {
    Admin,
    AdminQueryParams,
    CreateAdminDto,
    UpdateAdminDto,
    PaginatedResponse,
} from "@/types";

export const adminService = {
    getAll: async (params?: AdminQueryParams): Promise<PaginatedResponse<Admin>> => {
        const response = await request.get("/admins", { params });
        return response.data;
    },

    getById: async (id: string): Promise<Admin> => {
        const response = await request.get(`/admins/${id}`);
        return response.data.data;
    },

    create: async (data: CreateAdminDto): Promise<Admin> => {
        const response = await request.post("/admins", data);
        return response.data;
    },

    update: async (id: string, data: UpdateAdminDto): Promise<Admin> => {
        const response = await request.patch(`/admins/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await request.delete(`/admins/${id}`);
    },

    restore: async (id: string): Promise<Admin> => {
        const response = await request.patch(`/admins/${id}/restore`);
        return response.data;
    },

    activate: async (id: string): Promise<Admin> => {
        const response = await request.patch(`/admins/${id}/activate`);
        return response.data;
    },

    deactivate: async (id: string): Promise<Admin> => {
        const response = await request.patch(`/admins/${id}/deactivate`);
        return response.data;
    },

    changePassword: async (
        id: string,
        data: { currentPassword: string; newPassword: string; confirmPassword: string }
    ): Promise<Admin> => {
        const response = await request.patch(`/admins/${id}/change-password`, data);
        return response.data;
    },
};

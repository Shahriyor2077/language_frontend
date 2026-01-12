import { request } from "@/config/request";
import type { Teacher } from "@/types";

interface CreateTeacherDto {
    email: string;
    phoneNumber: string;
    fullName: string;
    password: string;
    confirm_password: string;
    cardNumber: string;
    googleId: string;
    isActive?: boolean;
    specification?: string;
    level?: string;
    description?: string;
    hourPrice?: number;
    portfolioLink?: string;
    experience?: string;
}

export const teacherService = {
    getAll: async (): Promise<{ message: string; teachers: Teacher[] }> => {
        const response = await request.get("/teacher");
        return response.data;
    },

    getById: async (id: string): Promise<{ message: string; teacher: Teacher }> => {
        const response = await request.get(`/teacher/${id}`);
        return response.data;
    },

    create: async (data: CreateTeacherDto): Promise<Teacher> => {
        const response = await request.post("/teacher", data);
        return response.data;
    },

    update: async (id: string, data: Partial<Teacher>): Promise<Teacher> => {
        const response = await request.patch(`/teacher/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await request.delete(`/teacher/${id}`);
    },

    uploadImage: async (id: string, file: File): Promise<Teacher> => {
        const formData = new FormData();
        formData.append("image", file);
        const response = await request.post(`/teacher/${id}/upload-image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
};

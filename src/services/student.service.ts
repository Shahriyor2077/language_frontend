import { request } from "@/config/request";
import type { Student, StudentQueryParams, PaginatedResponse } from "@/types";

export const studentService = {
    getAll: async (params?: StudentQueryParams): Promise<PaginatedResponse<Student>> => {
        const response = await request.get("/students", { params });
        return response.data;
    },

    getById: async (id: string): Promise<Student> => {
        const response = await request.get(`/students/${id}`);
        return response.data;
    },

    create: async (data: Partial<Student>): Promise<Student> => {
        const response = await request.post("/students", data);
        return response.data;
    },

    update: async (id: string, data: Partial<Student>): Promise<Student> => {
        const response = await request.patch(`/students/${id}`, data);
        return response.data;
    },

    block: async (id: string, reason: string): Promise<Student> => {
        const response = await request.patch(`/students/${id}/block`, { reason });
        return response.data;
    },

    unblock: async (id: string): Promise<Student> => {
        const response = await request.patch(`/students/${id}/unblock`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await request.delete(`/students/${id}`);
    },

    restore: async (id: string): Promise<Student> => {
        const response = await request.patch(`/students/${id}/restore`);
        return response.data;
    },
};

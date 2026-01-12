import { request } from "@/config/request";
import type { Student, StudentQueryParams, PaginatedResponse } from "@/types";

export const studentService = {
    // Get all students
    getAll: async (params?: StudentQueryParams): Promise<PaginatedResponse<Student>> => {
        const response = await request.get("/students", { params });
        return response.data;
    },

    // Get student by ID
    getById: async (id: string): Promise<Student> => {
        const response = await request.get(`/students/${id}`);
        return response.data;
    },

    // Create student
    create: async (data: Partial<Student>): Promise<Student> => {
        const response = await request.post("/students", data);
        return response.data;
    },

    // Update student
    update: async (id: string, data: Partial<Student>): Promise<Student> => {
        const response = await request.patch(`/students/${id}`, data);
        return response.data;
    },

    // Block student
    block: async (id: string, reason: string): Promise<Student> => {
        const response = await request.patch(`/students/${id}/block`, { reason });
        return response.data;
    },

    // Unblock student
    unblock: async (id: string): Promise<Student> => {
        const response = await request.patch(`/students/${id}/unblock`);
        return response.data;
    },

    // Delete student (soft)
    delete: async (id: string): Promise<void> => {
        await request.delete(`/students/${id}`);
    },

    // Restore student
    restore: async (id: string): Promise<Student> => {
        const response = await request.patch(`/students/${id}/restore`);
        return response.data;
    },
};

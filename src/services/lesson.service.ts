import { request } from "@/config/request";
import type { Lesson } from "@/types";

interface LessonsResponse {
    statusCode: number;
    message: string;
    count: number;
    page: number;
    limit: number;
    lessons: Lesson[];
}

export const lessonService = {
    // Get all lessons
    getAll: async (page = 1, limit = 10): Promise<LessonsResponse> => {
        const response = await request.get("/lesson", { params: { page, limit } });
        return response.data;
    },

    // Get lesson by ID
    getById: async (id: string): Promise<Lesson> => {
        const response = await request.get(`/lesson/${id}`);
        return response.data;
    },

    // Get lessons by teacher
    getByTeacher: async (teacherId: string): Promise<{ lessons: Lesson[] }> => {
        const response = await request.get(`/lesson/${teacherId}/teacher`);
        return response.data;
    },

    // Create lesson
    create: async (data: Partial<Lesson>): Promise<Lesson> => {
        const response = await request.post("/lesson", data);
        return response.data;
    },

    // Update lesson
    update: async (id: string, data: Partial<Lesson>): Promise<Lesson> => {
        const response = await request.patch(`/lesson/${id}`, data);
        return response.data;
    },

    // Delete lesson
    delete: async (id: string): Promise<void> => {
        await request.delete(`/lesson/${id}`);
    },
};

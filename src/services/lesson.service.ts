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
    getAll: async (page = 1, limit = 10): Promise<LessonsResponse> => {
        const response = await request.get("/lesson", { params: { page, limit } });
        return response.data;
    },

    getById: async (id: string): Promise<Lesson> => {
        const response = await request.get(`/lesson/${id}`);
        return response.data;
    },

    getByTeacher: async (teacherId: string): Promise<{ lessons: Lesson[] }> => {
        const response = await request.get(`/lesson/${teacherId}/teacher`);
        return response.data;
    },

    create: async (data: Partial<Lesson>): Promise<Lesson> => {
        const response = await request.post("/lesson", data);
        return response.data;
    },

    update: async (id: string, data: Partial<Lesson>): Promise<Lesson> => {
        const response = await request.patch(`/lesson/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await request.delete(`/lesson/${id}`);
    },
};

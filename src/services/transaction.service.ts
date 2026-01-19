import { request } from "@/config/request";
import type { Transaction, TransactionQueryParams, PaginatedResponse } from "@/types";

export const transactionService = {
    getAll: async (params?: TransactionQueryParams): Promise<PaginatedResponse<Transaction>> => {
        const response = await request.get("/transactions", { params });
        return response.data;
    },

    getById: async (id: string): Promise<Transaction> => {
        const response = await request.get(`/transactions/${id}`);
        return response.data;
    },

    getByStudent: async (studentId: string): Promise<Transaction[]> => {
        const response = await request.get(`/transactions/student/${studentId}`);
        return response.data;
    },

    getByLesson: async (lessonId: string): Promise<Transaction[]> => {
        const response = await request.get(`/transactions/lesson/${lessonId}`);
        return response.data;
    },

    create: async (data: {
        lessonId: string;
        studentId: string;
        price: number;
    }): Promise<Transaction> => {
        const response = await request.post("/transactions", data);
        return response.data;
    },

    update: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
        const response = await request.patch(`/transactions/${id}`, data);
        return response.data;
    },

    cancel: async (id: string, reason?: string): Promise<Transaction> => {
        const response = await request.patch(`/transactions/${id}/cancel`, { reason });
        return response.data;
    },

    complete: async (id: string): Promise<Transaction> => {
        const response = await request.patch(`/transactions/${id}/complete`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await request.delete(`/transactions/${id}`);
    },
};

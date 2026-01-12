import { request } from "@/config/request";
import type { TeacherPayment } from "@/types";

export const teacherPaymentService = {
    // Get all teacher payments
    getAll: async (): Promise<{ payments: TeacherPayment[] }> => {
        const response = await request.get("/teacher-payments");
        return response.data;
    },

    // Get payment by ID
    getById: async (id: string): Promise<TeacherPayment> => {
        const response = await request.get(`/teacher-payments/${id}`);
        return response.data;
    },

    // Create payment
    create: async (data: {
        teacherId: string;
        lessonId: string;
        totalLessonAmount: number;
        platformComission: number;
        platformAmount: number;
        teacherAmount: number;
        paidBy: string;
        notes?: string;
    }): Promise<TeacherPayment> => {
        const response = await request.post("/teacher-payments", data);
        return response.data;
    },

    // Update payment
    update: async (id: string, data: Partial<TeacherPayment>): Promise<TeacherPayment> => {
        const response = await request.patch(`/teacher-payments/${id}`, data);
        return response.data;
    },

    // Cancel payment
    cancel: async (
        id: string,
        canceledBy: string,
        canceledReason?: string
    ): Promise<TeacherPayment> => {
        const response = await request.patch(`/teacher-payments/${id}/cancel`, {
            canceledBy,
            canceledReason,
        });
        return response.data;
    },

    // Delete payment
    delete: async (id: string): Promise<void> => {
        await request.delete(`/teacher-payments/${id}`);
    },
};

export type AdminRole = "admin" | "superAdmin";

export interface Admin {
    id: string;
    username: string;
    role: AdminRole;
    phoneNumber: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdminQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: AdminRole;
    isActive?: boolean;
}

export interface CreateAdminDto {
    username: string;
    password: string;
    phoneNumber: string;
    role?: AdminRole;
    isActive?: boolean;
}

export interface UpdateAdminDto {
    username?: string;
    phoneNumber?: string;
    role?: AdminRole;
    isActive?: boolean;
    newPassword?: string;
}

export type TeacherSpecialty = "english" | "french" | "spanish" | "italian" | "german";
export type TeacherLevel = "b2" | "c1" | "c2";

export interface Teacher {
    id: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    cardNumber: string;
    isActive: boolean;
    isDeleted: boolean;
    specification: TeacherSpecialty;
    level: TeacherLevel;
    description?: string;
    hourPrice?: number;
    portfolioLink?: string;
    imageUrl?: string;
    rating?: number;
    experience?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Student {
    id: string;
    lastName: string;
    firstName: string;
    phoneNumber: string;
    tgId: string;
    tgUsername?: string;
    isActive: boolean;
    isBlocked: boolean;
    blockedAt?: string;
    blockedReason?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface StudentQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isBlocked?: boolean;
}

export type LessonStatus = "available" | "booked" | "completed" | "cancelled";

export interface Lesson {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    teacherId: string;
    studentId: string;
    googleMeetsUrl: string;
    status: LessonStatus;
    price: number;
    isPaid: boolean;
    bookedAt: string;
    completedAt?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    teacher?: Teacher;
    student?: Student;
}

export type TransactionStatus = "pending" | "paid" | "cancelled";

export interface Transaction {
    id: string;
    lessonId: string;
    studentId: string;
    price: number;
    status: TransactionStatus;
    canceledTime?: string;
    performedTime?: string;
    reason?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    lesson?: Lesson;
    student?: Student;
}

export interface TransactionQueryParams {
    page?: number;
    limit?: number;
    status?: TransactionStatus;
    studentId?: string;
    lessonId?: string;
}

export interface TeacherPayment {
    id: string;
    teacherId: string;
    lessonId: string;
    totalLessonAmount: number;
    platformComission: number;
    platformAmount: number;
    teacherAmount: number;
    paidBy: string;
    paidAt: string;
    isCanceled: boolean;
    canceledAt?: string;
    canceledBy?: string;
    canceledReason?: string;
    notes?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    teacher?: Teacher;
    lesson?: Lesson;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPage: number;
    };
}

export interface LoginDto {
    username: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    id: string;
    role: string;
    accessToken: string;
    refreshToken?: string;
}

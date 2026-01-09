export const TeacherSpecialty = {
  ENGLISH: "english",
  FRENCH: "french",
  SPANISH: "spanish",
  GERMAN: "german",
  ITALIAN: "italian",
} as const;

export type TeacherSpecialty =
  (typeof TeacherSpecialty)[keyof typeof TeacherSpecialty];

export const TeacherLevel = {
  B2: "b2",
  C1: "c1",
  C2: "c2",
} as const;

export type TeacherLevel = (typeof TeacherLevel)[keyof typeof TeacherLevel];

interface LessonSummary {
  id: string;
  completedAt: Date | string;
  status: string;
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  specification: TeacherSpecialty;
  level: TeacherLevel;
  description: string | null;
  hourPrice: number | null;
  portfolioLink: string | null;
  imageUrl: string | null;
  rating: number;
  experience: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  cardNumber: string;
  lessons: LessonSummary[];
}

export interface TeacherField {
  fullName: string;
  email: string;
  phoneNumber: string;
  specification: TeacherSpecialty;
  level: TeacherLevel;
  description: string | null;
  hourPrice: number | null;
  portfolioLink: string | null;
  imageUrl: string | null;
  experience: string;
  cardNumber: string;
}

export interface LessonResponse {
  id: string;
  status: string;
}

export interface Payment {
  id: string;
  lessonId: string;
  teacherId: string;
  totalLessonAmount: number;
  platformComission: number;
  platformAmount: number;
  teacherAmount: number;
  paidAt: string;
  paidBy: string;
  notes: string;
  isCanceled: boolean;
  canceledAt: string | null;
  canceledBy: string | null;
  canceledReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export const LessonStatus = {
  Available: "available",
  Booked: "booked",
  Completed: "completed",
  Cancelled: "cancelled",
};
export type LessonStatus = (typeof LessonStatus)[keyof typeof LessonStatus];

export interface Lesson {
  id: string;
  name: string;
  status: LessonStatus;
  price: string | number;

  startTime: string;
  endTime: string;
  bookedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  googleMeetsUrl: string;
  googleEventId: string | null;
  remainedLessonId: string | null;
  isPaid: boolean;
  isDeleted: boolean;

  teacherId: string;
  studentId: string;

  teacher?: any;
  student?: any;
}

export interface GetTeacherLessonsResponse {
  message: string;
  lessons: Lesson[];
}

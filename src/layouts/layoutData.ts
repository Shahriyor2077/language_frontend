import {
  Book,
  CalendarRange,
  User,
  Wallet,
  Users,
  GraduationCap,
  BarChart3,
  CreditCard,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

export const links = {
  teacher: [
    {
      title: "Darslarim",
      url: "/app/teacher/lessons",
      icon: Book,
    },
    {
      title: "Jadval",
      url: "/app/teacher/schedules",
      icon: CalendarRange,
    },
    {
      title: "To'lovlarim",
      url: "/app/teacher/payments",
      icon: Wallet,
    },
    {
      title: "Profil",
      url: "/app/teacher/profile",
      icon: User,
    },
  ],
  admin: [
    {
      title: "Statistika",
      url: "/app/admin",
      icon: BarChart3,
    },
    {
      title: "O'qituvchilar",
      url: "/app/admin/teachers",
      icon: GraduationCap,
    },
    {
      title: "O'quvchilar",
      url: "/app/admin/students",
      icon: Users,
    },
    {
      title: "To'lovlar",
      url: "/app/admin/payments",
      icon: CreditCard,
    },
    {
      title: "Daromadlar",
      url: "/app/admin/earnings",
      icon: DollarSign,
    },
  ],
  superAdmin: [
    {
      title: "Statistika",
      url: "/app/admin",
      icon: BarChart3,
    },
    {
      title: "Adminlar",
      url: "/app/admin/admins",
      icon: ShieldCheck,
    },
    {
      title: "O'qituvchilar",
      url: "/app/admin/teachers",
      icon: GraduationCap,
    },
    {
      title: "O'quvchilar",
      url: "/app/admin/students",
      icon: Users,
    },
    {
      title: "Darslar",
      url: "/app/admin/lessons",
      icon: Book,
    },
    {
      title: "To'lovlar",
      url: "/app/admin/payments",
      icon: CreditCard,
    },
    {
      title: "Daromadlar",
      url: "/app/admin/earnings",
      icon: DollarSign,
    },
  ],
};

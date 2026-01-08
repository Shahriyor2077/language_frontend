import { Book, CalendarRange, User, Wallet } from "lucide-react";

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
};

import Admins from "@/pages/admins/admins/Admins";
import Earnings from "@/pages/admins/earnings/Earnings";
import Lessons from "@/pages/admins/lessons/Lessons";
import Payments from "@/pages/admins/payments/Payments";
import Students from "@/pages/admins/students/Students";
import Teachers from "@/pages/admins/teachers/Teachers";
import Profile from "@/pages/admins/Profile";

export default [
    {
        path: "profile",
        page: Profile
    },
    {
        path: "admins",
        page: Admins
    },
    {
        path: "teachers",
        page: Teachers,
    },
    {
        path: "students",
        page: Students,
    },
    {
        path: "lessons",
        page: Lessons
    },
    {
        path: "payments",
        page: Payments
    },
    {
        path: "earnings",
        page: Earnings
    }
]
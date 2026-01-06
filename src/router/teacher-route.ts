import Lessons from "@/pages/teachers/lessons/Lessons";
import Payments from "@/pages/teachers/payments/Payments";
import Profile from "@/pages/teachers/Profile";
import Schedules from "@/pages/teachers/schedules/Schedules";

export default  [
    { 
        path: "lessons",
        page: Lessons
    },
    { 
        path: "schedules",
        page: Schedules
    },
    { 
        path: "payments",
        page: Payments
    },
    { 
        path: "profile",
        page: Profile
    }
]
import { request } from "@/config/request";
import { useQuery } from "@tanstack/react-query";

export const useTeacherProfile = () => {
  return useQuery({
    queryKey: ["teacher-profile"],
    queryFn: () => request.get("/auth/teacher/me").then((res) => res.data),
  });
};

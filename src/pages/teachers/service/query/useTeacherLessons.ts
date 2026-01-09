import { request } from "@/config/request";
import { useQuery } from "@tanstack/react-query";

export const useGetTeacherLessons = (teacherId: string) => {
  return useQuery({
    queryKey: ["teacher-lessons", teacherId],
    queryFn: () =>
      request.get(`lesson/${teacherId}/teacher`).then((res) => res.data),
  });
};

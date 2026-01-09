import { request } from "@/config/request";
import { useMutation } from "@tanstack/react-query";
import type { TeacherField } from "../../TeacherTypes";

export const useUpdateTeacherProfile = (teacherId: string) => {
  return useMutation({
    mutationFn: (data: TeacherField) =>
      request.patch(`/teacher/${teacherId}`, data),
  });
};

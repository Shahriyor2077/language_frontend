import { useMutation } from "@tanstack/react-query";
import type { LessonField } from "../../TeacherTypes";
import { request } from "@/config/request";

export const useCreateLesson = () => {
  return useMutation({
    mutationFn: (data: LessonField) => request.post("/lesson", data),
  });
};
